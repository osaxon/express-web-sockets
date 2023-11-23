import { ReactNode } from "react";

export const Layout = ({
    children,
    user,
}: {
    children: ReactNode;
    user: string;
}) => {
    return (
        <div className="p-8">
            <nav>
                {<div className="flex md:order-2">{user ?? "no user"}</div>}
            </nav>
            <div className="grid place-items-center mt-8 mx-auto max-w-7xl">
                {children}
            </div>
        </div>
    );
};
