import { Seo } from '@/components/ui/Seo';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';

export function NotFound() {
  return (
    <>
      <Seo title="Page Not Found" noindex />
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
          <Reveal>
            <p className="heading-eyebrow">404</p>
            <h1 className="mt-4 text-display font-serif font-medium text-navy-900">Page Not Found</h1>
            <p className="mx-auto mt-4 max-w-md text-base font-light leading-relaxed text-charcoal-500">
              The page you are looking for may have been moved or no longer exists. Let us guide you back.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink to="/" variant="primary" size="md">
                Return Home
              </ButtonLink>
              <ButtonLink to="/collections/bridal" variant="secondary" size="md">
                Explore Collection
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Container>
    </>
  );
}
