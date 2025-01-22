import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { fetchCampersFormacion, fetchMeritsCamperById, fetchAllMerits } from "../../services/camperService";
import "react-lazy-load-image-component/src/effects/blur.css";
import "./styles/CampersGrid.css";
import { useNavigate } from "react-router-dom";

const defaultProfileImage = "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg";

const CampersGrid = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [campersPerPage, setCampersPerPage] = useState(8);
    const [expandedSkills, setExpandedSkills] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [predefinedSkills, setpredefinedSkills] = useState([]);
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [campersData, setCampersData] = useState([]);
    const navigate = useNavigate();

    const mobileVisibleSkillsCount = 4;
    const desktopVisibleSkillsCount = predefinedSkills.length;

    const generateCircuitLines = () => {
        return Array(8).fill().map((_, i) => {
            const style = {
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                transform: `rotate(${Math.random() * 45 - 22.5}deg)`,
            };

            return (
                <div key={i} className="circuit-line" style={style}>
                    <div className="circuit-dot"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                </div>
            );
        });
    };

    const generateConnectionDots = () => {
        return Array(30).fill().map((_, i) => (
            <div
                key={i}
                className="connection-dot"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                }}
            />
        ));
    };

    const handleSponsorClick = () => {
        if (location.pathname === '/') {
            // Si ya estás en la página de inicio, realiza el desplazamiento
            const section = document.getElementById('sponsro');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Si no estás en la página de inicio, navega y luego desplázate
            navigate('/');
            setTimeout(() => {
                const section = document.getElementById('sponsro');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500); // Tiempo para asegurar que la página cargue
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const campers = await fetchCampersFormacion();
                const allMerits = await fetchAllMerits();

                const campersWithMeritsPromises = campers.map(async (camper) => {
                    const skills = await fetchMeritsCamperById(camper.camper_id);
                    return {
                        ...camper,
                        skills,
                    };
                });

                const campersWithMerits = await Promise.all(campersWithMeritsPromises);

                setpredefinedSkills(allMerits);
                setCampersData(campersWithMerits);
                setIsLoading(false);
            } catch (err) {
                setError("Error al cargar los datos de los campers.");
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const updateDimensions = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            setCampersPerPage(mobile ? 4 : 8);
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const visibleSkills = isMobile
        ? isFilterExpanded
            ? predefinedSkills
            : predefinedSkills.slice(0, mobileVisibleSkillsCount)
        : predefinedSkills.slice(0, desktopVisibleSkillsCount);

    const filteredCampers =
        selectedSkills.length === 0
            ? campersData
            : campersData.filter((camper) =>
                selectedSkills.every((skill) =>
                    camper.skills.some((camperSkill) => camperSkill.id === skill.id)
                )
            );

    const startIndex = (currentPage - 1) * campersPerPage;
    const currentCampers = filteredCampers.slice(
        startIndex,
        startIndex + campersPerPage
    );
    console.log("currentCampers:", currentCampers)
    console.log("CamperData: ", campersData)
    console.log("predefinedStills", predefinedSkills)
    console.log(selectedSkills)

    const handleSkillFilter = (skill) => {
        setSelectedSkills((prev) =>
            prev.some(s => s.id === skill.id)
                ? prev.filter((s) => s.id !== skill.id)
                : [...prev, skill]
        );
        setCurrentPage(1);
    };

    return (
        <section className="campersgrid">
            {/* Líneas de circuito */}
            <div className="circuit-lines">
                {generateCircuitLines()}
            </div>

            {/* Puntos de conexión */}
            <div className="connection-dots">
                {generateConnectionDots()}
            </div>
            <div className="badge-filters">
                <h3>Busca a Tu Camper</h3>
                <div className="skill-filters wrapper-filter">
                    <div
                        className={`filter-buttons ${isFilterExpanded ? "expanded" : ""}`}
                    >
                        <AnimatePresence>
                            {visibleSkills.map((skill) => (
                                <motion.div
                                    key={skill.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <Button
                                        className={`skill-button icon-filter badgeInfo ${selectedSkills.some(selectedSkill => selectedSkill.id === skill.id) ? "selected" : "outline"
                                            }`}
                                        onClick={() => handleSkillFilter(skill)}
                                    >
                                        <div className="tooltip-filter">{skill.description}</div>
                                        {skill.name + " "} {skill.icon}
                                    </Button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    {isMobile && predefinedSkills.length > mobileVisibleSkillsCount && (
                        <button
                            className={`expand-filters-button ${isFilterExpanded ? "expanded" : ""
                                }`}
                            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                        >
                            {isFilterExpanded ? "Ver menos" : "Ver más"}
                            <ChevronDown
                                className={`ml-2 h-4 w-4 transition-transform ${isFilterExpanded ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                    )}
                </div>
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={currentPage} className="grid-container">
                    {currentCampers.map((camper) => (
                        <div key={camper.camper_id} className="developer-card">
                            <div className="dev-card-content">
                                <div className="camper-image">
                                    <LazyLoadImage
                                        src={
                                            camper.profile_picture && camper.profile_picture.trim() !== ""
                                                ? camper.profile_picture
                                                : "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"
                                        }
                                        alt={camper.full_name}
                                        effect="blur"
                                        className="w-full h-[300px] object-cover rounded-lg"
                                    />

                                </div>
                                <div className="camper-maininfo">
                                    <h3>{camper.full_name}</h3>
                                    <p>{camper.title}</p>

                                    <div className="technologies">
                                        <span className="tech-label">Méritos:</span>
                                        <div layout className="skills-wrapper wrapper">
                                            <div
                                                className={`skills-container ${expandedSkills[camper.camper_id] ? "expanded" : ""
                                                    }`}
                                            >
                                                <AnimatePresence>
                                                    {camper.skills.map((skill, index) => (
                                                        <motion.div
                                                            key={skill.id}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            className="skill-item-mp"
                                                        >
                                                            {skill.name + " "}{skill.icon}
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                            {camper.skills.length > 4 && (
                                                <button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="expand-skills-button"
                                                    onClick={() =>
                                                        setExpandedSkills((prev) => ({
                                                            ...prev,
                                                            [camper.camper_id]: !prev[camper.camper_id],
                                                        }))
                                                    }
                                                >
                                                    {expandedSkills[camper.camper_id] ? "Ver menos" : "Ver más"}
                                                    <ChevronDown
                                                        className={`ml-2 h-4 w-4 transition-transform ${expandedSkills[camper.camper_id] ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="buttons">
                                        <button
                                            className="info-button"
                                            onClick={() => navigate(`/campers/profile/${camper.camper_id}`)}
                                        >
                                            Mas Info
                                        </button>
                                        <button
                                            className="sponsor-button"
                                            onClick={handleSponsorClick}
                                        >
                                            Patrocinar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>
            <DotPagination
                current={currentPage}
                pageSize={campersPerPage}
                total={filteredCampers.length}
                onChange={setCurrentPage}
            />
        </section>
    );

};


const DotPagination = ({ current, total, pageSize, onChange }) => {
    const pageCount = Math.ceil(total / pageSize);
  
    return (
      <motion.div
        className="flex justify-center gap-2 md:gap-4 mt-12 md:mt-24 z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        {/* Generar botones para todas las páginas */}
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
          <motion.button
            key={page}
            onClick={() => onChange(page)}
            className={`rounded-full transition-all duration-300 ${
              page === current
                ? "bg-color2 w-12 md:w-16 h-3 md:h-[12px] scale-110" // Botón activo
                : "bg-swiper-bullet-bg hover:bg-swiper-bullet-hover-bg w-3 md:w-[12px] h-3 md:h-[12px]" // Botones normales
            }`}
            whileHover={{ scale: 1.2 }}
            aria-label={`Go to page ${page}`}
          />
        ))}
      </motion.div>
    );
  };

export default CampersGrid;