import React from 'react';

function TemplateSelector({ templates, selectedTemplateId, onSelectTemplate }) {
  if (!templates || templates.length === 0) {
    return <p>No templates available.</p>;
  }

  return (
    <div>
      <h3>Select a Template</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            style={{
              border: selectedTemplateId === template.id ? '2px solid blue' : '1px solid #ccc',
              padding: '10px',
              cursor: 'pointer',
              width: '150px', // Basic styling
            }}
          >
            <h4>{template.name}</h4>
            {template.preview_image_url && (
              <img
                src={template.preview_image_url}
                alt={template.name}
                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
              />
            )}
            {/* <p style={{fontSize: '0.8em', whiteSpace: 'pre-wrap'}}>{template.structure_definition}</p> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateSelector;
