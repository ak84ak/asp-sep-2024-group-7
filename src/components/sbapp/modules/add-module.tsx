import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import {useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import AddModulePredefined from "@/components/sbapp/modules/add-module-predefined";
import AddModuleNew from "@/components/sbapp/modules/add-module-new";
import {toast} from "sonner";

export default function AddModuleDialog(props: { onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<string>("predefined");

    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            props.onClose();
        }
    }

    const onAddSuccess = () => {
        toast.success("Module added");
        props.onClose();
    }

    return (
        <Dialog open={true} onOpenChange={onOpenChange} defaultOpen={true}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogTitle>
                    Add Module
                </DialogTitle>
                <Tabs defaultValue="login" className="mt-4" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="new">Add new</TabsTrigger>
                        <TabsTrigger value="predefined">Existing</TabsTrigger>
                    </TabsList>
                    <TabsContent value="new">
                        <AddModuleNew onAddSuccess={onAddSuccess} />
                    </TabsContent>
                    <TabsContent value="predefined">
                        <AddModulePredefined onCreateNewSwitch={() => setActiveTab("new")} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}