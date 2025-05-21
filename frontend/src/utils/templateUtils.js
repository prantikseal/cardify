export const renderTemplate = (htmlString, data) => {
  if (!htmlString || !data) {
    return '';
  }

  let processedHtml = htmlString;

  // Replace simple placeholders
  for (const key in data) {
    if (data.hasOwnProperty(key) && typeof data[key] !== 'object') {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedHtml = processedHtml.replace(regex, data[key] || '');
    }
  }

  // Replace social media link placeholders
  if (data.social_media_links) {
    for (const socialKey in data.social_media_links) {
      if (data.social_media_links.hasOwnProperty(socialKey)) {
        // Assuming placeholders like {{linkedin_url}}, {{twitter_url}}
        const placeholderKey = `${socialKey}_url`; 
        const regex = new RegExp(`{{${placeholderKey}}}`, 'g');
        processedHtml = processedHtml.replace(regex, data.social_media_links[socialKey] || '');
      }
    }
  }
  
  // Specific handling for logo_url to prevent broken images if URL is empty
  // If logo_url is empty, we might want to remove the img tag or hide it.
  // For simplicity, if logo_url is empty, it will become <img src="" ...>, browser handles this.
  // A more complex regex could remove the whole img tag if src is empty:
  // processedHtml = processedHtml.replace(/<img[^>]*src=["']{{logo_url}}["'][^>]*>/g, data.logo_url ? `<img src="${data.logo_url}" alt="Logo">` : '');
  // But for now, the simple replacement above handles {{logo_url}} -> ""
  
  // Fallback for any remaining placeholders to avoid showing them
  processedHtml = processedHtml.replace(/{{[^}]+}}/g, '');


  return processedHtml;
};
