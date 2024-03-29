import Link from "next/link";

interface CustomLinkProps {
    type?: "Link" | "a";
    href: string;
    children?: React.ReactNode;
    className?: string;
    newTab?: boolean;
    innerClassName?: string;
    outerComponent?: "div" | "span";
}

/**
 * CustomLink is a wrapper around Next.js' Link component and the default anchor tag.
 * @param type - The type of link to render. Defaults to "Link".
 * @param href - The href of the link.
 * @param children - The children of the link.
 * @param className - The className of the link.
 * @returns
 */
const CustomLink: React.FC<CustomLinkProps> = ({
    type = "Link",
    href,
    children,
    className,
    innerClassName,
    newTab = false,
    outerComponent = "div",
}) => {
    const LinkComponent = type === "Link" ? Link : "a";
    const OuterComponent = outerComponent === "div" ? "div" : "span";

    return (
        <OuterComponent className={`hover:text-gray-300 ${className}`}>
            <LinkComponent
                href={href}
                target={newTab ? "_blank" : "_self"}
                rel={newTab ? "noreferrer noopener" : ""}
                className={innerClassName}
            >
                {children}
            </LinkComponent>
        </OuterComponent>
    );
};

export default CustomLink;
