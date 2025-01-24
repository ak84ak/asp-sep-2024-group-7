import {ICourseModule} from "@/models/api/ModulesModels";
import {useState} from "react";
import ModulesTreeModule from "@/components/sbapp/modules/modules-tree-module";
import AddActivityManual from "@/components/sbapp/modules/add-activity-manual";
import {toast} from "sonner";

export type ModulesTreeProperties = {
    modules: ICourseModule[];
    onModuleSelect?: (module: ICourseModule) => void;
}

export default function ModulesTree(props: ModulesTreeProperties) {
    const [addActivityModuleId, setAddActivityModuleId] = useState<string | undefined>(undefined);
    const [addActivityWeek, setAddActivityWeek] = useState<number | undefined>(undefined);
    const [addActivityOpen, setAddActivityOpen] = useState(false);

    const [importModuleId, setImportModuleId] = useState<string | undefined>(undefined);
    const [importWeek, setImportWeek] = useState<number | undefined>(undefined);
    const [isImportOpen, setIsImportOpen] = useState(false);

    const addActivityManual = (moduleId: string, week: number) => {
        setAddActivityModuleId(moduleId);
        setAddActivityWeek(week);
        setAddActivityOpen(true);
    };

    const onImport = (moduleId: string, week: number) => {

    }

    const onAddSuccess = () => {
        toast.success("Activity added");
        setAddActivityOpen(false);
        setAddActivityModuleId(undefined);
        setAddActivityWeek(undefined);
    }

    return (
        <>
            <div className="w-full flex flex-col gap-1">
                {props.modules.map((m) => (
                    <ModulesTreeModule
                        key={m.id}
                        module={m}
                        onAddActivityManual={addActivityManual}
                        onImport={onImport}
                    />
                ))}
            </div>
            {addActivityOpen && addActivityModuleId && addActivityWeek !== undefined && (
                <AddActivityManual
                    week={addActivityWeek!}
                    moduleId={addActivityModuleId!}
                    onClose={() => {
                        setAddActivityOpen(false);
                        setAddActivityModuleId(undefined);
                        setAddActivityWeek(undefined);
                    }}
                    onAddSuccess={onAddSuccess}
                />
            )}
        </>
    )
}