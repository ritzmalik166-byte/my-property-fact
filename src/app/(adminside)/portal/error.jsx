"use client";
export default function PortalErrorPage({reset, error}) {
    return(
        <>
            <h1 className="text-center">An Unexpected error occured on portal dashboard.</h1>
            <p>{error.message}</p>
            <button onClick={()=> reset()}>
                Try Again
            </button>
        </>
    )
}