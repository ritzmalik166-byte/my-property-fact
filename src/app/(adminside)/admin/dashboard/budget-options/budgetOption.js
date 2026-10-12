"use client";
import { useState } from "react";
import DashboardHeader from "../common-model/dashboardHeader";
import CommonModal from "../common-model/common-model";
import GenerateForm from "../common-model/generateForm";

export default function BudgetOption() {
    //defining input fields 
    const inputFields = [
        {
            id: 'budget',
            label: 'Budget Option'
        }
    ];
    const getInitialFormData = () => Object.fromEntries(inputFields.map(item => [item.id, '']));
    const [validated, setValidated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [buttonName, setButtonName] = useState("");
    const [formData, setFormData] = useState(getInitialFormData);
    const [confirmBox, setConfirmBox] = useState(false);
    const [showLoading, setShowLoading] = useState(false);

    //Handle opening add model
    const openAddModel = () => {
        setShowModal(true);
        setTitle("Add New Budget Option");
        setButtonName("Add");
    };
    //handle edit model
    const openEditModel = () => {
        setShowModal(true);
        setTitle("Update Budget Option");
        setButtonName("Update");
    };
    return (
        <div>
            <DashboardHeader
                buttonName={"+ Add New"}
                heading={"Manage Budget Options"}
                functionName={openAddModel}
            />
            <GenerateForm
                api={""}
                buttonName={buttonName}
                formData={formData}
                inputFields={inputFields}
                setButtonName={setButtonName}
                setFormData={setFormData}
                setShowLoading={setShowLoading}
                setShowModal={setShowModal}
                setValidated={setValidated}
                showLoading={showLoading}
                showModal={showModal}
                title={title}
                validated={validated}
            />

            <CommonModal
                api={""}
                confirmBox={confirmBox}
                setConfirmBox={setConfirmBox}
            />
        </div>
    );
}
