/*
    * OnBoardingTitle.tsx
    * A component for displaying the title and description on onboarding screens, featuring a logo and styled text.
    * Is used in the initial steps of the onboarding process to welcome users and provide context about Sandom Lager.
    * Author: Emil Berglund
*/

import logoUrl from '../../assets/logo.png';

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
                    className="mb-4 mx-auto"
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
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    minHeight: '2.6em',
                }}
            >
                {description}
            </p>
        </section>
    );
}