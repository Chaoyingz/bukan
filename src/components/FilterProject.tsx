import {
    getAllProjects,
    createProject,
    setActivedProjectId,
    deleteProject,
    updateProjectName,
    createProjectCustomProperty,
} from "../tauri";
import { useEffect, useState } from "react";
import { Toast } from "@douyinfe/semi-ui";
import { Config, Project, ProjectCustomProperty } from "../types";
import { IButton } from "./IButton";
import { IconPlus } from "@douyinfe/semi-icons";
import { FilterProjectOption } from "./FilterProjectOption";

type FilterProps = {
    config: Config;
    setConfig: (config: Config) => void;
};

export const FilterProject = ({ config, setConfig }: FilterProps) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeOptionId, setActiveOptionId] = useState<number>(-1);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectCustomProperty, setNewProjectCustomProperty] =
        useState<ProjectCustomProperty>();

    const fetchProjects = async () => {
        const newProjects = await getAllProjects();
        setProjects(newProjects);
    };
    useEffect(() => {
        fetchProjects();
    }, []);
    const createNewProject = async () => {
        const newProject = await createProject("Untitled Project");
        const newConfig = { ...config, actived_project_id: newProject.id };
        fetchProjects();
        setActivedProjectId(newConfig);
        setConfig(newConfig);
    };

    const handleSelectProject = async (projectId: number) => {
        if (projectId === config.actived_project_id) {
            setActiveOptionId(projectId);
            return;
        }
        const newConfig = { ...config, actived_project_id: projectId };
        setActivedProjectId(newConfig);
        setConfig(newConfig);
    };
    const handleDeleteProject = async (projectId: number) => {
        if (projects.length === 1) {
            Toast.error("You can't delete the last project");
            return;
        }
        await deleteProject(projectId)
            .then(() => {
                fetchProjects();
                handleSelectProject(projects[projects.length - 2].id);
                Toast.success("Project deleted successfully");
            })
            .catch((e) => {
                Toast.error(`Failed to delete project ${e}`);
            });
    };
    const handleRenameProject = async (projectId: number) => {
        await updateProjectName(projectId, newProjectName)
            .then(() => {
                fetchProjects();
                Toast.success("Project renamed successfully");
            })
            .catch((e) => {
                Toast.error(`Failed to rename project ${e}`);
            });
    };
    const handleCreateProjectCustomProperty = async () => {
        if (!newProjectCustomProperty) {
            return;
        }
        await createProjectCustomProperty(newProjectCustomProperty)
            .then(() => {
                fetchProjects();
                Toast.success("Custom property created successfully");
            })
            .catch((e) => {
                Toast.error(`Failed to create custom property ${e}`);
            });
    };
    useEffect(() => {
        if (newProjectCustomProperty) {
            handleCreateProjectCustomProperty();
        }
    }, [newProjectCustomProperty]);
    return (
        <div className="-mb-1 flex items-center">
            {projects.map((project) => (
                <div
                    className={
                        "py-[2px] relative" +
                        (project.id === config.actived_project_id
                            ? " border-b-2 border-ngray-100"
                            : "")
                    }
                    key={project.id}
                >
                    <IButton
                        className="hover:bg-ngray-8 px-2"
                        onClick={() => handleSelectProject(project.id)}
                    >
                        <button className="bg-transparent">
                            <div className="text-sm text-ngray-100 font-semibold mr-1">
                                {project.name}
                            </div>
                        </button>
                    </IButton>
                    <FilterProjectOption
                        project={project}
                        activeOptionId={activeOptionId}
                        setActiveOptionId={setActiveOptionId}
                        setNewProjectName={setNewProjectName}
                        setNewProjectCustomProperty={
                            setNewProjectCustomProperty
                        }
                        onDeleteProject={() => handleDeleteProject(project.id)}
                        onRenameProject={() => handleRenameProject(project.id)}
                    ></FilterProjectOption>
                </div>
            ))}
            <IButton className="ml-1 h-6" onClick={() => createNewProject()}>
                <button className="bg-transparent flex items-center">
                    <IconPlus size="small" />
                </button>
            </IButton>
        </div>
    );
};
