import logoUrl from '../../assets/temp_logo.svg';

type OnBoardingTitleProps = {
    description: string;
};

export default function OnBoardingTitle({ description }: OnBoardingTitleProps) {
    return (
        <section>
            <figure>
                <img
                    src={logoUrl}
                    alt="Sandom Lager Logo"
                    className="w-24 h-24 mb-4 mx-auto"
                />
            </figure>
            <h1
                className="text-center text-4xl font-bold"
                style={{ color: 'var(--color-header-text-primary)' }}
            >
                Sandom Lager
            </h1>
            <p
                className="text-center text-md mt-2 mx-auto leading-snug"
                style={{
                    color: 'var(--color-text-secondary)',
                    maxWidth: '28ch',
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    overflow: 'hidden',
                    minHeight: '2.6em',
                }}
            >
                {description}
            </p>
        </section>
    );
}