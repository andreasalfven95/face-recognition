import React from "react";
import "./Errors.css";

const Errors = ({ isThereError, errorMessage }) => {
    if (isThereError) {
        return (
            <div className="center ma">
                <div className="mt2">
                    <h3>
                        {errorMessage}
                    </h3>
                </div>
            </div>
        );
    } else {
        return (
            <>
            </>
        );
    }
}

export default Errors;