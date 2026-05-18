/*
    * OnBoardingButton.tsx
    * A versatile button component for onboarding screens, supporting both link and native button functionalities with multiple styling variants.
    * Is used across various onboarding steps to provide consistent call-to-action buttons for users.   
    * Author: Emil Berglund
*/

import { Link } from 'react-router-dom';
import type { ButtonHTMLAttributes, CSSProperties } from 'react';

type OnBoardingButtonVariant = 'primary' | 'secondary' | 'white';

type OnBoardingButtonBaseProps = {
    text: string;
    variant?: OnBoardingButtonVariant;
    className?: string;
};

type OnBoardingButtonLinkProps = OnBoardingButtonBaseProps & {
    to: string;
    type?: never;
    onClick?: never;
};

type OnBoardingButtonNativeProps = OnBoardingButtonBaseProps & {
    to?: never;
    type?: 'button' | 'submit' | 'reset';
    onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
};

type OnBoardingButtonProps = OnBoardingButtonLinkProps | OnBoardingButtonNativeProps;

export default function OnBoardingButton(props: OnBoardingButtonProps) {
    const { text, variant = 'primary', className } = props;
    const baseClassName = 'w-full inline-flex items-center justify-center px-4 py-2 rounded-md transition-colors cursor-pointer';

    const style: CSSProperties =
        variant === 'primary'
            ? {
                backgroundImage:
                    'linear-gradient(180deg, var(--color-primary-gradient-from), var(--color-primary-gradient-to))',
                color: 'var(--color-on-primary)',
            }
            : variant === 'secondary'
                ? {
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                }
                : {
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                };

    const computedClassName =
        variant === 'primary'
            ? `${baseClassName} hover:opacity-95`
            : `${baseClassName} hover:opacity-90`;

    const mergedClassName = className ? `${computedClassName} ${className}` : computedClassName;

    if ('to' in props && typeof props.to === 'string') {
        return (
            <Link to={props.to} className={mergedClassName} style={style}>
                {text}
            </Link>
        );
    }

    return (
        <button type={props.type ?? 'button'} onClick={props.onClick} className={mergedClassName} style={style}>
            {text}
        </button>
    );
}