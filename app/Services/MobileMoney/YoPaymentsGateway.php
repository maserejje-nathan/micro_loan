<?php

namespace App\Services\MobileMoney;

use App\Contracts\MobileMoneyGateway;
use App\Enums\MobileMoneyStatus;
use App\Models\MobileMoneyTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class YoPaymentsGateway implements MobileMoneyGateway
{
    public function disburse(MobileMoneyTransaction $transaction): MobileMoneyTransaction
    {
        return $this->request($transaction, 'acwithdrawfunds', 'Loan disbursement');
    }

    public function collect(MobileMoneyTransaction $transaction): MobileMoneyTransaction
    {
        return $this->request($transaction, 'acdepositfunds', 'Loan repayment');
    }

    protected function request(
        MobileMoneyTransaction $transaction,
        string $method,
        string $narrative,
    ): MobileMoneyTransaction {
        $config = config('payments.yo');
        $externalReference = 'LN-'.$transaction->id.'-'.Str::upper(Str::random(6));

        $xml = $this->buildXml(
            username: (string) $config['username'],
            password: (string) $config['password'],
            method: $method,
            account: $this->normalizePhone($transaction->phone),
            amount: (string) $transaction->amount,
            narrative: $narrative,
            externalReference: $externalReference,
            nonBlocking: (bool) $config['non_blocking'],
        );

        $response = Http::withHeaders([
            'Content-Type' => 'text/xml',
            'Content-transfer-encoding' => 'text',
        ])->withBody($xml, 'text/xml')->post($this->apiUrl());

        $parsed = $this->parseResponse($response->body());

        if (($parsed['Status'] ?? null) === 'OK') {
            $transaction->update([
                'status' => MobileMoneyStatus::Completed,
                'external_id' => $parsed['TransactionReference'] ?? $parsed['TransactionStatus'] ?? $externalReference,
                'payload' => array_merge($transaction->payload ?? [], [
                    'yo' => $parsed,
                    'method' => $method,
                ]),
            ]);
        } else {
            $transaction->update([
                'status' => MobileMoneyStatus::Failed,
                'payload' => array_merge($transaction->payload ?? [], [
                    'yo' => $parsed,
                    'method' => $method,
                ]),
            ]);
        }

        return $transaction->fresh();
    }

    protected function apiUrl(): string
    {
        $config = config('payments.yo');

        return $config['sandbox']
            ? $config['sandbox_api_url']
            : $config['api_url'];
    }

    protected function buildXml(
        string $username,
        string $password,
        string $method,
        string $account,
        string $amount,
        string $narrative,
        string $externalReference,
        bool $nonBlocking,
    ): string {
        $nonBlockingValue = $nonBlocking ? 'TRUE' : 'FALSE';

        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<AutoCreate>
  <Request>
    <APIUsername>{$username}</APIUsername>
    <APIPassword>{$password}</APIPassword>
    <Method>{$method}</Method>
    <NonBlocking>{$nonBlockingValue}</NonBlocking>
    <Account>{$account}</Account>
    <Amount>{$amount}</Amount>
    <Narrative>{$narrative}</Narrative>
    <ExternalReference>{$externalReference}</ExternalReference>
  </Request>
</AutoCreate>
XML;
    }

    /**
     * @return array<string, mixed>
     */
    protected function parseResponse(string $body): array
    {
        if ($body === '') {
            return ['Status' => 'ERROR', 'message' => 'Empty response'];
        }

        $previous = libxml_use_internal_errors(true);
        $xml = simplexml_load_string($body);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if ($xml === false) {
            return ['Status' => 'ERROR', 'raw' => $body];
        }

        $response = $xml->Response ?? $xml;

        return [
            'Status' => (string) ($response->Status ?? ''),
            'StatusCode' => (string) ($response->StatusCode ?? ''),
            'StatusMessage' => (string) ($response->StatusMessage ?? ''),
            'TransactionReference' => (string) ($response->TransactionReference ?? ''),
            'TransactionStatus' => (string) ($response->TransactionStatus ?? ''),
        ];
    }

    protected function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone) ?? $phone;

        if (str_starts_with($digits, '0')) {
            return '256'.substr($digits, 1);
        }

        if (! str_starts_with($digits, '256')) {
            return '256'.$digits;
        }

        return $digits;
    }
}
