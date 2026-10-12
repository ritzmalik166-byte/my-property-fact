"use client";
import { useEffect } from "react";
export default function ProjectAmenityError({error, reset}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <>
            <div className="my-5 text-center">
                <h4 className="text-danger">Something went worng !</h4>
                <p className="text-muted">{error?.message}</p>

                <button
                    onClick={() => reset()}
                    className="btn btn-outline-primary mt-3"
                >
                    Try again
                </button>
            </div>
        </>
    );
}