import React from 'react';

function CardPreview({ cardData, template }) {
  if (!cardData) {
    return <p>Enter card details to see a preview.</p>;
  }

  return (
    <div style={{ border: '1px solid #eee', padding: '20px', margin: '20px 0' }}>
      <h3>Card Preview</h3>
      {template && (
        <p><strong>Selected Template:</strong> {template.name || 'N/A'} (ID: {template.id})</p>
      )}
      <hr />
      <p><strong>Full Name:</strong> {cardData.full_name || 'N/A'}</p>
      <p><strong>Job Title:</strong> {cardData.job_title || 'N/A'}</p>
      <p><strong>Company Name:</strong> {cardData.company_name || 'N/A'}</p>
      {cardData.logo_url && <div><strong>Logo:</strong> <img src={cardData.logo_url} alt="logo" style={{maxWidth: '100px', maxHeight: '50px'}}/></div>}
      <p><strong>Card Slug:</strong> {cardData.card_slug || 'N/A'}</p>
      <p><strong>Phone:</strong> {cardData.phone_number || 'N/A'}</p>
      <p><strong>Email:</strong> {cardData.email || 'N/A'}</p>
      <p><strong>Website:</strong> {cardData.website_url || 'N/A'}</p>
      <p><strong>Address:</strong> {cardData.address || 'N/A'}</p>
      <p><strong>Description:</strong> {cardData.business_description || 'N/A'}</p>
      
      <h4>Social Media:</h4>
      <ul>
        {cardData.social_media_links?.linkedin && <li>LinkedIn: {cardData.social_media_links.linkedin}</li>}
        {cardData.social_media_links?.twitter && <li>Twitter: {cardData.social_media_links.twitter}</li>}
        {cardData.social_media_links?.github && <li>GitHub: {cardData.social_media_links.github}</li>}
        {cardData.social_media_links?.other && <li>Other: {cardData.social_media_links.other}</li>}
      </ul>

      {/* 
      If template structure_definition is available and simple, you could try a basic render:
      {template && template.structure_definition && (
        <div>
          <h4>Template Structure Preview:</h4>
          <div dangerouslySetInnerHTML={{ __html: template.structure_definition
            .replace('{full_name}', cardData.full_name || '')
            .replace('{job_title}', cardData.job_title || '')
            // ... and so on for other placeholders
          }} />
        </div>
      )}
      */}
    </div>
  );
}

export default CardPreview;
