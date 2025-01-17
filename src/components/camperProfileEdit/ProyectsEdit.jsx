import React, { useEffect, useState } from "react";
import ProjectCardEdit from "./ProjectCardEdit";
import { useParams } from "react-router-dom";
import { ProyectsModal } from "./modals/ProyectsModal";
import { ProyectsEditModal } from "./modals/ProyectsEditModal";
import styles from "./styles/ProyectsEdit.module.css";
import {
  getProjects,
  addProjects,
  updateProject,
} from "../../services/proyectsService";
import {
  getTechnology,
  getTechnologyForProject,
} from "../../services/technologiesService";
import { toast } from "react-toastify";

const ProyectsEdit = () => {
  // Estados iniciales con valores por defecto seguros
  const [projects, setProjects] = useState([]);
  const [availableTechnologies, setAvailableTechnologies] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();

  // Cargar tecnologías disponibles
  useEffect(() => {
    let isMounted = true;

    const loadAvailableTechnologies = async () => {
      try {
        const response = await getTechnology();
        if (isMounted) {
          setAvailableTechnologies(response.data || []);
        }
      } catch (error) {
        console.error("Error al cargar tecnologías:", error);
        if (isMounted) {
          setError("Error al cargar tecnologías");
          setAvailableTechnologies([]);
        }
      }
    };

    loadAvailableTechnologies();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cargar proyectos
  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await getProjects(id);

        if (isMounted) {
          const formattedProjects = projectsData.map((project) => ({
            id: project.id,
            title: project.title || "",
            description: project.description || "",
            image: project.image || "",
            code_url: project.code_url || "",
          }));
          setProjects(formattedProjects);
        }
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
        if (isMounted) {
          setError("Error al cargar proyectos");
          setProjects([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProjects();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleEditProject = async (project) => {
    try {
      setLoading(true);
      // Cargar las tecnologías específicas del proyecto
      const response = await getTechnologyForProject(project.id);
      const techIds = response.technologies?.map((tech) => tech.id) || [];

      setSelectedProject({
        ...project,
        technologyIds: techIds,
      });
      setIsEditing(true);
    } catch (error) {
      console.error("Error al cargar tecnologías del proyecto:", error);
      // Aún permitimos editar el proyecto, pero sin tecnologías
      setSelectedProject({
        ...project,
        technologyIds: [],
      });
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (updatedProject) => {
    try {
      setLoading(true);
      const response = await updateProject(
        id,
        updatedProject.id,
        updatedProject
      );

      if (response) {
        setProjects((prevProjects) =>
          prevProjects.map((proj) =>
            proj.id === updatedProject.id ? updatedProject : proj
          )
        );
        setIsEditing(false);
        setSelectedProject(null);
      }
    } catch (error) {
      toast.error("error al actualizar el proyecto", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (newProject) => {
    try {
      setLoading(true);
      const response = await addProjects(newProject);

      if (response) {
        // Recargar los proyectos después de añadir uno nuevo
        const projectsData = await getProjects(id);
        setProjects(projectsData);
      }
    } catch (error) {
      console.error("Error al añadir proyecto:", error);
      alert("Error al añadir el proyecto");
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className={styles.tecInfo}>
      <h2 className={styles.profileSubtitle}>
        <span className={styles.highlight}>&lt;/</span> Mis Proyectos
      </h2>

      <div className={styles.projects} id="projects-profile">
        {/* Botón de añadir proyecto */}
        <div className={styles.projectCard}>
          <div className={styles.projectCardAdd}>
            <ProyectsModal
              onAddProject={handleAddProject}
              technologies={availableTechnologies}
              closeModal={() => setIsEditing(false)}
            />
          </div>
        </div>

        {/* Manejo de estados: error, carga y contenido */}
        {error ? (
          <div className={styles.projectCard}>
            <div className={styles.projectCardAdd}>
              <div className="text-center p-4">
                El camper no tiene proyectos disponibles...
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center p-4">Cargando...</div>
        ) : (
          projects.map((project) => (
            <ProjectCardEdit
              key={project.id}
              {...project}
              onEdit={() => handleEditProject(project)}
            />
          ))
        )}

        {/* Modal de edición */}
        {isEditing && selectedProject && (
          <ProyectsEditModal
            project={selectedProject}
            technologies={availableTechnologies}
            onUpdateProject={handleUpdateProject}
            onClose={() => {
              setIsEditing(false);
              setSelectedProject(null);
            }}
          />
        )}
      </div>
    </section>
  );
};

export default ProyectsEdit;
