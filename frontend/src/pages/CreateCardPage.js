import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CardForm from '../components/CardForm/CardForm';
import CardPreview from '../components/CardPreview/CardPreview';
import cardService from '../services/cardService';
// import authService from '../services/authService'; // Already imported by cardService if needed directly

function CreateCardPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    template_id: '',
    card_slug: '',
    logo_url: '',
    company_name: '',
    full_name: '',
    job_title: '',
    phone_number: '',
    email: '',
    website_url: '',
    address: '',
    social_media_links: {
      linkedin: '',
      twitter: '',
      github: '',
      other: '',
    },
    business_description: '',
    is_active: true, // Default to active
  });

  const [selectedTemplateObject, setSelectedTemplateObject] = useState(null);
  const [templates, setTemplates] = useState([]); // To find the selected template object
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch templates once on mount to be able to find the selected template object
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await cardService.getTemplates();
        setTemplates(response.data || []);
      } catch (err) {
        setError('Failed to fetch templates for preview.');
        console.error(err);
      }
    };
    fetchTemplates();
  }, []);

  const handleFormChange = useCallback((newData) => {
    setFormData(newData);
    if (newData.template_id) {
      const foundTemplate = templates.find(t => t.id === parseInt(newData.template_id));
      setSelectedTemplateObject(foundTemplate || null);
    } else {
      setSelectedTemplateObject(null);
    }
  }, [templates]); // Include templates in dependency array

  const handleCreateCard = async () => {
    setMessage('');
    setError('');
    if (!formData.template_id) {
      setError('Please select a template.');
      return;
    }
    if (!formData.card_slug || !formData.full_name) {
        setError('Card Slug and Full Name are required.');
        return;
    }

    try {
      // Token is handled by cardService.createCard internally
      const response = await cardService.createCard(formData);
      setMessage(`Card created successfully! ID: ${response.data.id}`);
      // console.log('Card created:', response.data);
      // Optionally, clear form or redirect
      // setFormData({ ...initial empty state ... }); 
      // setSelectedTemplateObject(null);
      navigate('/dashboard'); // Redirect to dashboard or a page showing the new card
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create card.');
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <div style={{ flex: 1 }}>
        <h2>Create New Business Card</h2>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <CardForm
          onFormChange={handleFormChange}
          onSubmit={handleCreateCard}
          initialData={formData} // Pass current form data to keep it controlled
        />
      </div>
      <div style={{ flex: 1, position: 'sticky', top: '20px', height: '90vh', overflowY: 'auto' }}>
        <CardPreview cardData={formData} template={selectedTemplateObject} />
      </div>
    </div>
  );
}

export default CreateCardPage;
