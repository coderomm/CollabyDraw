import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SignupWelcomeButton() {
    const { data: session } = useSession();
    return (
        <>
            {
                session?.user.id ? (
                    <></>
                ) : (
                    <Link className="welcome-screen-menu-item " href="/auth/signin">
                        <div className="welcome-screen-menu-item__icon">
                            <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" className="" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                <g strokeWidth="1.5">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"></path>
                                    <path d="M21 12h-13l3 -3"></path>
                                    <path d="M11 15l-3 -3"></path>
                                </g>
                            </svg>
                        </div>
                        <div className="welcome-screen-menu-item__text">Sign up</div>
                    </Link >
                )
            }
        </>
    )
}