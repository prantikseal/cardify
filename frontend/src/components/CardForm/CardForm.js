import React, { useState, useEffect } from 'react';
import cardService from '../../services/cardService';
import TemplateSelector from './TemplateSelector';

function CardForm({ onFormChange, onSubmit, initialData = {} }) {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    template_id: initialData.template_id || '',
    card_slug: initialData.card_slug || '',
    logo_url: initialData.logo_url || '',
    company_name: initialData.company_name || '',
    full_name: initialData.full_name || '',
    job_title: initialData.job_title || '',
    phone_number: initialData.phone_number || '',
    email: initialData.email || '',
    website_url: initialData.website_url || '',
    address: initialData.address || '',
    social_media_links: {
      linkedin: initialData.social_media_links?.linkedin || '',
      twitter: initialData.social_media_links?.twitter || '',
      github: initialData.social_media_links?.github || '',
      other: initialData.social_media_links?.other || '',
    },
    business_description: initialData.business_description || '',
    // custom_css: initialData.custom_css || '', // If needed
    // is_active: initialData.is_active !== undefined ? initialData.is_active : true, // If needed
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await cardService.getTemplates();
        setTemplates(response.data || []);
        if (response.data && response.data.length > 0 && !formData.template_id) {
          // Auto-select first template if none is selected
          // handleTemplateSelect(response.data[0].id); 
        }
      } catch (err) {
        setError('Failed to fetch templates.');
        console.error(err);
      }
    };
    fetchTemplates();
  }, []); // formData.template_id dependency removed to avoid re-fetching on every selection

  useEffect(() => {
    onFormChange(formData);
  }, [formData, onFormChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      social_media_links: {
        ...prevData.social_media_links,
        [name]: value,
      },
    }));
  };

  const handleTemplateSelect = (templateId) => {
    setFormData((prevData) => ({
      ...prevData,
      template_id: templateId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(); // Parent component handles the actual submission logic
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <TemplateSelector
        templates={templates}
        selectedTemplateId={formData.template_id}
        onSelectTemplate={handleTemplateSelect}
      />

      <h3>Card Details</h3>
      <div>
        <label htmlFor="card_slug">Card Slug (URL, e.g., my-unique-card)</label>
        <input type="text" name="card_slug" value={formData.card_slug} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="full_name">Full Name</label>
        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="job_title">Job Title</label>
        <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="company_name">Company Name</label>
        <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="logo_url">Logo URL</label>
        <input type="url" name="logo_url" value={formData.logo_url} onChange={handleChange} placeholder="https://example.com/logo.png"/>
      </div>
      <div>
        <label htmlFor="phone_number">Phone Number</label>
        <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="website_url">Website URL</label>
        <input type="url" name="website_url" value={formData.website_url} onChange={handleChange} placeholder="https://example.com"/>
      </div>
      <div>
        <label htmlFor="address">Address</label>
        <input type="text" name="address" value={formData.address} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="business_description">Business Description</label>
        <textarea name="business_description" value={formData.business_description} onChange={handleChange} />
      </div>

      <h4>Social Media Links</h4>
      <div>
        <label htmlFor="linkedin">LinkedIn Profile URL</label>
        <input type="url" name="linkedin" value={formData.social_media_links.linkedin} onChange={handleSocialChange} placeholder="https://linkedin.com/in/..."/>
      </div>
      <div>
        <label htmlFor="twitter">Twitter Profile URL</label>
        <input type="url" name="twitter" value={formData.social_media_links.twitter} onChange={handleSocialChange} placeholder="https://twitter.com/..."/>
      </div>
      <div>
        <label htmlFor="github">GitHub Profile URL</label>
        <input type="url" name="github" value={formData.social_media_links.github} onChange={handleSocialChange} placeholder="https://github.com/..."/>
      </div>
      <div>
        <label htmlFor="other">Other Social Link</label>
        <input type="url" name="other" value={formData.social_media_links.other} onChange={handleSocialChange} />
      </div>
      
      {/* Example for is_active if needed
      <div>
        <label>
          <input type="checkbox" name="is_active" checked={formData.is_active} onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))} />
          Card Active
        </label>
      </div>
      */}

      <button type="submit" style={{marginTop: '20px'}}>Create Card</button>
    </form>
  );
}

export default CardForm;
