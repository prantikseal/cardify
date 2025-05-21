import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import cardService from '../services/cardService';

function PublicCardPage() {
  const { card_slug } = useParams(); // From routing parameter

  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allTemplates, setAllTemplates] = useState([]); // To store all templates

  const [appointmentFormData, setAppointmentFormData] = useState({
    requester_name: '',
    requester_email: '',
    proposed_time: '',
  });
  const [appointmentSuccessMessage, setAppointmentSuccessMessage] = useState('');
  const [appointmentErrorMessage, setAppointmentErrorMessage] = useState('');

  useEffect(() => {
    const fetchPageData = async () => {
      if (!card_slug) return;

      setLoading(true);
      setError('');
      try {
        // Fetch card data by slug
        const cardResponse = await cardService.getPublicCardBySlug(card_slug);
        setCardData(cardResponse.data);

        // Fetch all templates (if not already available globally/context)
        // This is inefficient if not cached/global, but fulfills the requirement for now
        // Assuming cardResponse.data.template_html is NOT yet available from backend
        if (!cardResponse.data.template_html) { 
          const templatesResponse = await cardService.getTemplates();
          setAllTemplates(templatesResponse.data || []);
        }

      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch page data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [card_slug]);

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setAppointmentFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    setAppointmentSuccessMessage('');
    setAppointmentErrorMessage('');

    if (!appointmentFormData.requester_name || !appointmentFormData.requester_email || !appointmentFormData.proposed_time) {
        setAppointmentErrorMessage('All fields are required for appointment booking.');
        return;
    }

    try {
      await cardService.bookAppointment(card_slug, appointmentFormData);
      setAppointmentSuccessMessage('Appointment request submitted successfully!');
      setAppointmentFormData({ requester_name: '', requester_email: '', proposed_time: '' }); // Clear form
    } catch (err) {
      setAppointmentErrorMessage(err.response?.data?.message || err.message || 'Failed to submit appointment request.');
      console.error(err);
    }
  };

  if (loading) {
    return <p>Loading card...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  if (!cardData) {
    return <p>Card not found.</p>;
  }

  // Determine the template HTML
  let templateHtmlToRender = '';
  let selectedTemplate = null;

  if (cardData.template_html) { // Ideal case: backend provides the HTML
    templateHtmlToRender = renderTemplate(cardData.template_html, cardData);
  } else if (allTemplates.length > 0 && cardData.template_id) {
    selectedTemplate = allTemplates.find(t => t.id === cardData.template_id);
    if (selectedTemplate && selectedTemplate.structure_definition) {
      templateHtmlToRender = renderTemplate(selectedTemplate.structure_definition, cardData);
    } else {
      // Fallback if template not found or has no structure_definition
      templateHtmlToRender = "<p>Error: Card template could not be loaded.</p>";
    }
  } else if (!loading) { 
    // If still no templateHTML and not loading, means templates haven't loaded or card has no template_id
     templateHtmlToRender = "<p>Error: Card template information is missing.</p>";
  }


  return (
    <div style={{ padding: '20px' }}>
      {/* Render the card using dangerouslySetInnerHTML */}
      {templateHtmlToRender ? (
        <div dangerouslySetInnerHTML={{ __html: templateHtmlToRender }} />
      ) : (
        !loading && <p>Card content could not be rendered.</p> 
        // Show only if not loading and still no html, otherwise loading message is shown
      )}
      
      {/* Appointment Booking Section - kept separate from the card's HTML structure */}
      <section style={{ marginTop: '30px', borderTop: '2px solid #007bff', paddingTop: '20px', background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{color: '#007bff', borderBottom: '1px solid #dee2e6', paddingBottom: '10px'}}>Book an Appointment with {cardData.full_name}</h3>
        {appointmentSuccessMessage && <p style={{ color: 'green' }}>{appointmentSuccessMessage}</p>}
        {appointmentErrorMessage && <p style={{ color: 'red' }}>{appointmentErrorMessage}</p>}
        <form onSubmit={handleAppointmentSubmit}>
          <div>
            <label htmlFor="requester_name">Your Name:</label><br/>
            <input
              type="text"
              id="requester_name"
              name="requester_name"
              value={appointmentFormData.requester_name}
              onChange={handleAppointmentChange}
              required
            />
          </div>
          <div style={{marginTop: '10px'}}>
            <label htmlFor="requester_email">Your Email:</label><br/>
            <input
              type="email"
              id="requester_email"
              name="requester_email"
              value={appointmentFormData.requester_email}
              onChange={handleAppointmentChange}
              required
            />
          </div>
          <div style={{marginTop: '10px'}}>
            <label htmlFor="proposed_time">Proposed Time (e.g., "Next Monday at 3 PM"):</label><br/>
            <input
              type="text"
              id="proposed_time"
              name="proposed_time"
              value={appointmentFormData.proposed_time}
              onChange={handleAppointmentChange}
              required
            />
          </div>
          <button type="submit" style={{marginTop: '15px'}}>Request Appointment</button>
        </form>
      </section>
    </div>
  );
}

export default PublicCardPage;
