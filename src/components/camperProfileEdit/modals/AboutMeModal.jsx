import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Edit } from 'lucide-react';
import { updateCamperAboutMe } from '@/services/camperService';
import { useParams } from 'react-router-dom';

const AboutMeModal = ({ initialData, onUpdate }) => {
    const { id } = useParams(); // Get camperId from URL
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        about: initialData?.about || '',
        videoUrl: initialData?.videoUrl || ''
    });

    useEffect(() => {
        const navbar = document.querySelector('.navbar-profile');
        if (navbar) {
            navbar.classList.toggle('navbar-hidden', isOpen);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await updateCamperAboutMe(id, formData);
            setIsOpen(false);
            if (onUpdate) {
                onUpdate(formData); // Update parent component state
            }
        } catch (err) {
            setError('Error al actualizar la información. Por favor intenta de nuevo.');
            console.error('Update error:', err);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghostNoHover" size="icon">
                    <Edit className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto z-[9999] bg-white text-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-gray-900">Editar Sobre Mí</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Sobre Mí</label>
                        <Textarea
                            name="about"
                            className="text-gray-900 bg-gray-50 min-h-[150px]"
                            value={formData.about}
                            onChange={handleChange}
                            placeholder="Cuéntanos sobre ti..."
                            maxLength={500}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">URL del Video</label>
                        <Input
                            name="videoUrl"
                            className="text-gray-900 bg-gray-50"
                            value={formData.videoUrl}
                            onChange={handleChange}
                            placeholder="URL del video de presentación"
                            type="url"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <DialogTrigger asChild>
                            <Button variant="outline" disabled={isLoading}>
                                Cancelar
                            </Button>
                        </DialogTrigger>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AboutMeModal;