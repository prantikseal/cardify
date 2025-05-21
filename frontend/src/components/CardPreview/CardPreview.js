import React from 'react';
import { renderTemplate } from '../../utils/templateUtils';

function CardPreview({ cardData, template }) { // template is the selected template object
  if (!cardData || !template || !template.structure_definition) {
    return (
      <div style={{ border: '1px solid #eee', padding: '20px', margin: '20px 0', minHeight: '220px' }}>
        <h3>Card Preview</h3>
        <p>
          {(!cardData) && "Enter card details. "}
          {(!template || !template.structure_definition) && "Select a template to see a preview."}
        </p>
      </div>
    );
  }

  const renderedHtmlString = renderTemplate(template.structure_definition, cardData);

  return (
    <div style={{ border: '1px solid #eee', padding: '20px', margin: '20px 0' }}>
      <h3>Card Preview ({template.name})</h3>
      <div dangerouslySetInnerHTML={{ __html: renderedHtmlString }} />
    </div>
  );
}

export default CardPreview;
