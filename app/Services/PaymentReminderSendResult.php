<?php

namespace App\Services;

readonly class PaymentReminderSendResult
{
    /**
     * @param  list<string>  $channelsSent
     * @param  list<string>  $channelsSkipped
     */
    public function __construct(
        public bool $ok,
        public string $message,
        public array $channelsSent = [],
        public array $channelsSkipped = [],
    ) {}

    public function nothingSent(): bool
    {
        return $this->channelsSent === [];
    }
}
