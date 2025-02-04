import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from './VIdeoPlayer';
import AboutMeModal from '../camperProfileEdit/modals/AboutMeModal';

const AboutMe = ({ isEditable, videoUrl, about, camperInfoInitialData, onUpdate }) => {
  const [editableAbout, setEditableAbout] = useState(about);
  const navigate = useNavigate();

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

  const handleAboutChange = (e) => {
    setEditableAbout(e.target.value);
  };

  const handleSave = () => {
    // Aquí llamas a la función de actualización, pasando el nuevo "about"
    onUpdate(editableAbout);
  };

  return (
    <section className="py-8 w-full">
      <div className="grid grid-cols-[minmax(300px,60%),minmax(250px,40%)] gap-8 w-full max-w-screen-xl mx-auto">
        <div className="w-full min-w-[300px] max-w-[800px]">
          <VideoPlayer videoUrl={videoUrl} title="Historia Camper" />
        </div>
        <div className="flex flex-col gap-4 p-4 min-w-[250px] max-w-full">
          <h2 className="font-poppins font-bold text-white text-2xl mb-4">
            Acerca de
            {isEditable && (
              <AboutMeModal
                initialData={camperInfoInitialData}
                onUpdate={onUpdate}
              />
            )}
          </h2>
          {isEditable ? (
            <div>
              <button onClick={handleSave}>Cuéntanos sobre ti...</button>
            </div>
          ) : (
            <p>{about}</p>
          )}
          {!isEditable && (
            <button className="self-start bg-[#f7b500] text-black font-poppins font-semibold uppercase rounded-2xl py-3 px-8 border-0 cursor-pointer transition-colors duration-300 ease-in-out hover:bg-[#f0a500]" onClick={handleSponsorClick}>
              Patrocinar
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutMe;