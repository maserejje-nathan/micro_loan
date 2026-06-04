import { Form, Head } from '@inertiajs/react';
import { FormActions } from '@/components/form-actions';
import { FormField } from '@/components/form-field';
import { PlatformSettingsPage } from '@/components/admin/platform-settings-page';
import { PlatformLogoField } from '@/components/welcome/platform-logo-field';
import { WelcomeBannerSlideField } from '@/components/welcome/welcome-banner-slide-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateWelcome } from '@/actions/App/Http/Controllers/Admin/AdminPlatformSettingsController';
import { index as settingsIndex, welcome } from '@/routes/admin/settings';

type Step = { title: string; description: string };
type Feature = { title: string; description: string };
type BannerSlide = {
    image_url: string;
    path: string | null;
    preview_url: string | null;
    alt: string;
    caption: string;
};

type PlatformLogo = {
    logo_url: string;
    path: string | null;
    preview_url: string | null;
};

type WelcomeSettings = {
    logo: PlatformLogo;
    meta_title: string;
    hero_badge: string;
    hero_headline_prefix: string;
    hero_headline_highlight: string;
    hero_description: string;
    hero_primary_cta: string;
    hero_secondary_cta: string;
    highlights: string[];
    cta_title: string;
    cta_description: string;
    footer_tagline: string;
    popular_plan_slug: string;
    banner_slides: BannerSlide[];
    steps: Step[];
    features: Feature[];
};

export default function AdminWelcomeSettings({
    settings,
}: {
    settings: WelcomeSettings;
}) {
    return (
        <>
            <Head title="Welcome page settings" />
            <PlatformSettingsPage
                title="Welcome page"
                description="Edit the public marketing page. Use {app_name} in description fields to insert the application name."
                cardTitle="Page content"
                cardDescription="Changes appear on the home page immediately."
            >
                <Form
                    {...updateWelcome.form()}
                    encType="multipart/form-data"
                    forceFormData
                    className="space-y-8"
                >
                    {({ processing, errors }) => (
                        <>
                            <PlatformLogoField
                                previewUrl={settings.logo.preview_url}
                                logoUrl={settings.logo.logo_url}
                                storedPath={settings.logo.path}
                                imageError={errors.logo}
                                logoUrlError={errors.logo_url}
                            />

                            <section className="space-y-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Banner slider
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Images shown in the full-width carousel on the
                                    public home page. Upload a banner or paste an
                                    image URL / site path.
                                </p>
                                {(settings.banner_slides ?? []).map(
                                    (slide, index) => (
                                        <WelcomeBannerSlideField
                                            key={index}
                                            index={index}
                                            previewUrl={slide.preview_url}
                                            imageUrl={slide.image_url}
                                            storedPath={slide.path}
                                            alt={slide.alt}
                                            caption={slide.caption}
                                            imageError={
                                                errors[
                                                    `banner_slides.${index}.image`
                                                ]
                                            }
                                            imageUrlError={
                                                errors[
                                                    `banner_slides.${index}.image_url`
                                                ]
                                            }
                                        />
                                    ),
                                )}
                            </section>

                            <section className="space-y-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Hero section
                                </p>
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <FormField
                                        id="meta_title"
                                        label="Browser title"
                                        error={errors.meta_title}
                                        required
                                    >
                                        <Input
                                            id="meta_title"
                                            name="meta_title"
                                            defaultValue={settings.meta_title}
                                            className="h-10"
                                        />
                                    </FormField>
                                    <FormField
                                        id="hero_badge"
                                        label="Badge text"
                                        error={errors.hero_badge}
                                        required
                                    >
                                        <Input
                                            id="hero_badge"
                                            name="hero_badge"
                                            defaultValue={settings.hero_badge}
                                            className="h-10"
                                        />
                                    </FormField>
                                    <FormField
                                        id="hero_headline_prefix"
                                        label="Headline (before highlight)"
                                        error={errors.hero_headline_prefix}
                                        required
                                    >
                                        <Input
                                            id="hero_headline_prefix"
                                            name="hero_headline_prefix"
                                            defaultValue={
                                                settings.hero_headline_prefix
                                            }
                                            className="h-10"
                                        />
                                    </FormField>
                                    <FormField
                                        id="hero_headline_highlight"
                                        label="Headline highlight"
                                        error={errors.hero_headline_highlight}
                                        required
                                    >
                                        <Input
                                            id="hero_headline_highlight"
                                            name="hero_headline_highlight"
                                            defaultValue={
                                                settings.hero_headline_highlight
                                            }
                                            className="h-10"
                                        />
                                    </FormField>
                                </div>
                                <FormField
                                    id="hero_description"
                                    label="Hero description"
                                    error={errors.hero_description}
                                    required
                                >
                                    <Textarea
                                        id="hero_description"
                                        name="hero_description"
                                        rows={3}
                                        defaultValue={settings.hero_description}
                                    />
                                </FormField>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        id="hero_primary_cta"
                                        label="Primary button"
                                        error={errors.hero_primary_cta}
                                        required
                                    >
                                        <Input
                                            id="hero_primary_cta"
                                            name="hero_primary_cta"
                                            defaultValue={settings.hero_primary_cta}
                                            className="h-10"
                                        />
                                    </FormField>
                                    <FormField
                                        id="hero_secondary_cta"
                                        label="Secondary button"
                                        error={errors.hero_secondary_cta}
                                        required
                                    >
                                        <Input
                                            id="hero_secondary_cta"
                                            name="hero_secondary_cta"
                                            defaultValue={
                                                settings.hero_secondary_cta
                                            }
                                            className="h-10"
                                        />
                                    </FormField>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Highlights
                                </p>
                                {settings.highlights.map((highlight, index) => (
                                    <FormField
                                        key={index}
                                        id={`highlights_${index}`}
                                        label={`Highlight ${index + 1}`}
                                        error={errors[`highlights.${index}`]}
                                    >
                                        <Input
                                            id={`highlights_${index}`}
                                            name={`highlights[${index}]`}
                                            defaultValue={highlight}
                                            className="h-10"
                                        />
                                    </FormField>
                                ))}
                            </section>

                            <section className="space-y-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    How it works (steps)
                                </p>
                                {settings.steps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2"
                                    >
                                        <FormField
                                            id={`steps_${index}_title`}
                                            label={`Step ${index + 1} title`}
                                            error={errors[`steps.${index}.title`]}
                                        >
                                            <Input
                                                id={`steps_${index}_title`}
                                                name={`steps[${index}][title]`}
                                                defaultValue={step.title}
                                                className="h-10"
                                            />
                                        </FormField>
                                        <FormField
                                            id={`steps_${index}_description`}
                                            label="Description"
                                            error={
                                                errors[`steps.${index}.description`]
                                            }
                                            className="sm:col-span-2"
                                        >
                                            <Textarea
                                                id={`steps_${index}_description`}
                                                name={`steps[${index}][description]`}
                                                rows={2}
                                                defaultValue={step.description}
                                            />
                                        </FormField>
                                    </div>
                                ))}
                            </section>

                            <section className="space-y-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Platform features
                                </p>
                                {settings.features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2"
                                    >
                                        <FormField
                                            id={`features_${index}_title`}
                                            label={`Feature ${index + 1} title`}
                                            error={errors[`features.${index}.title`]}
                                        >
                                            <Input
                                                id={`features_${index}_title`}
                                                name={`features[${index}][title]`}
                                                defaultValue={feature.title}
                                                className="h-10"
                                            />
                                        </FormField>
                                        <FormField
                                            id={`features_${index}_description`}
                                            label="Description"
                                            error={
                                                errors[
                                                    `features.${index}.description`
                                                ]
                                            }
                                            className="sm:col-span-2"
                                        >
                                            <Textarea
                                                id={`features_${index}_description`}
                                                name={`features[${index}][description]`}
                                                rows={2}
                                                defaultValue={feature.description}
                                            />
                                        </FormField>
                                    </div>
                                ))}
                            </section>

                            <section className="space-y-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    CTA & footer
                                </p>
                                <FormField
                                    id="cta_title"
                                    label="Bottom CTA title"
                                    error={errors.cta_title}
                                    required
                                >
                                    <Input
                                        id="cta_title"
                                        name="cta_title"
                                        defaultValue={settings.cta_title}
                                        className="h-10"
                                    />
                                </FormField>
                                <FormField
                                    id="cta_description"
                                    label="Bottom CTA description"
                                    error={errors.cta_description}
                                    required
                                >
                                    <Textarea
                                        id="cta_description"
                                        name="cta_description"
                                        rows={2}
                                        defaultValue={settings.cta_description}
                                    />
                                </FormField>
                                <FormField
                                    id="footer_tagline"
                                    label="Footer tagline"
                                    error={errors.footer_tagline}
                                    required
                                >
                                    <Textarea
                                        id="footer_tagline"
                                        name="footer_tagline"
                                        rows={2}
                                        defaultValue={settings.footer_tagline}
                                    />
                                </FormField>
                                <FormField
                                    id="popular_plan_slug"
                                    label="Popular plan slug (pricing)"
                                    error={errors.popular_plan_slug}
                                    hint="Highlights this plan on the pricing section, e.g. professional"
                                >
                                    <Input
                                        id="popular_plan_slug"
                                        name="popular_plan_slug"
                                        defaultValue={settings.popular_plan_slug}
                                        className="h-10"
                                    />
                                </FormField>
                            </section>

                            <FormActions
                                processing={processing}
                                cancelHref={settingsIndex().url}
                                submitLabel="Save welcome content"
                            />
                        </>
                    )}
                </Form>
            </PlatformSettingsPage>
        </>
    );
}

AdminWelcomeSettings.layout = {
    breadcrumbs: [
        { title: 'Settings', href: settingsIndex().url },
        { title: 'Welcome page', href: welcome().url },
    ],
};
