"use client"

import "./page.css";
import {useContext, useEffect} from "react";
import {HomeContext} from "@/app/(home)/template";

export default function TermsPage() {
    const pageContext = useContext(HomeContext);

    useEffect(() => {
        pageContext.setShowFeaturesLink(false);
    }, [pageContext]);

    return (
        <>
            <main className="flex flex-col gap-8 row-start-2 items-start sm:items-start self-start">
                <div className="mx-auto text-justify w-full sm:w-[70vw] text-base">
                    <h1>Terms of Service</h1>
                    <p>
                        Welcome to Study Buddy. These Terms of Service (collectively the &quot;Terms&quot;) govern your
                        access to and use of the Study Buddy web application
                        (the &quot;Application&quot; or &quot;Service&quot;). These are the
                        Terms which govern your use of our Service and the agreement that operates between you and the
                        website owners. If you do not agree, terminate your use of it at once.
                    </p>

                    <h1>Acceptance of Terms</h1>
                    <p>
                        Study Buddy is for learners of any age.
                    </p>
                    <p>
                        You must be at least 13 years of age to use the Service.
                    </p>
                    <p>
                        If you are under 18 years old, you may only create an account with the verifiable consent of a
                        parent or legal guardian.
                    </p>
                    <p>
                        You are prohibited from using Study Buddy if you are under 13.
                    </p>
                    <p>
                        By using Study Buddy, you represent and warrant that you are abiding by these age requirements,
                        and, if you are under 18, that you have the consent of your parent or guardian.
                    </p>

                    <h1>Service Description</h1>
                    <p>
                        Study Buddy: A quick start and efficient study management tool (AI-powered study tool) for
                        university and school students, helps students develop a study plan tailored to them.
                    </p>
                    <p>
                        The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without any
                        warranty or guarantee of any kind as to its accuracy, reliability, or effectiveness.
                    </p>

                    <h1>Disclaimer of Liability</h1>
                    <p>
                        Study Buddy is a study aid tool, and NOT a replacement to an official university planner or your
                        academic advisor or tutor.
                    </p>
                    <p>
                        There is no assurance that AI-generated study plans and insights are fruitful, accurate, or
                        comprehensive.
                    </p>
                    <p>
                        You access the Service at your own risk. Study Buddy will not be liable for any missed
                        deadlines, academic performance issues, or losses arising from the use of Study Buddy.
                    </p>

                    <h1>Limitations</h1>
                    <p>
                        Study Buddy and its developers shall not be liable for any direct, indirect, incidental, or
                        consequential damages of any kind fully arising from or in connection with the use of the Service
                        permitted by law.
                    </p>

                    <h1>Privacy and Data Protection</h1>
                    <p>
                        No sale, rent or sharing of user data with third party.
                    </p>
                    <p>
                        As previously mentioned, Study Buddy does not save sensitive personal information, such as
                        passwords, financial information, or private academic information.
                    </p>
                    <p>
                        Data Protection for Minors: We do not knowingly collect personal information from children under
                        the age of 13.
                    </p>
                    <p>
                        Rights of Parents: If you are a parent or guardian and you become aware that your child under 13
                        has used the Service in Violation of the parents and allowed them to do so, please first contact us
                        support@studytracking.ai.
                    </p>

                    <h1>Security Precautions</h1>
                    <p>
                        Although we aim to protect your data, remember that no system is entirely
                        secure.
                    </p>
                    <p>
                        Cookies: Study Buddy may use essential cookies for core service functionality and analytics.
                    </p>

                    <h1>Termination of accounts and retention of data</h1>
                    <p>
                        We do not keep the user data longer than is reasonably necessary to provide the Service.
                    </p>
                    <p>
                        If a user does not log in for 12 months, their accounts may be deleted.
                    </p>
                    <p>
                        If users want to have their account deleted, they can do so by contacting support@studytracking.ai.
                    </p>

                    <h1>Changes to Terms</h1>
                    <p>
                        Study Buddy may change these Terms at any time. Significant changes will be notified to users.
                    </p>
                    <p>
                        Your continued use of our service following the effective date of any changes will constitute your
                        acceptance of the new term.
                    </p>

                    <h1>Governing Law</h1>
                    <p>
                        These Terms shall be governed by the laws of Canada. All disputes will be settled in the courts
                        of Canada.
                    </p>

                    <h1>Contact Information</h1>
                    <p>
                        If you have any questions about these Terms, please contact us at: support@studytracking.ai
                    </p>
                </div>
            </main>
        </>
    );
}
