import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // For linking to public card page
import cardService from '../services/cardService';
// import authService from '../services/authService'; // For user info if needed

function AdminDashboardPage() {
  const [userCards, setUserCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedCardAnalytics, setSelectedCardAnalytics] = useState({
    visitors: [], // Will be an array: [{ date: "YYYY-MM-DD", unique_visitors: count }, ...]
    messages: [], // Will be an array: [{ sender_name: "...", message_content: "...", ... }, ...]
    appointments: [], // Will be an array: [{ requester_name: "...", proposed_time: "...", ... }, ...]
    link_clicks: [], // Will be an array: [{ link_type: "...", link_url: "...", ... }, ...]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await cardService.getUserCards();
        setUserCards(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch user cards.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const handleSelectCard = useCallback((cardId) => {
    setSelectedCardId(cardId);
  }, []);

  // Effect to fetch real analytics when selectedCardId changes
  useEffect(() => {
    if (!selectedCardId) {
      setSelectedCardAnalytics({ visitors: [], messages: [], appointments: [], link_clicks: [] });
      return;
    }

    const fetchAnalyticsForCard = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError('');
      try {
        const [visitorsRes, messagesRes, appointmentsRes, linkClicksRes] = await Promise.all([
          cardService.getVisitorAnalytics(selectedCardId),
          cardService.getMessageAnalytics(selectedCardId),
          cardService.getAppointmentAnalytics(selectedCardId),
          cardService.getLinkClickAnalytics(selectedCardId)
        ]);

        setSelectedCardAnalytics({
          visitors: visitorsRes.data || [],
          messages: messagesRes.data || [],
          appointments: appointmentsRes.data || [],
          link_clicks: linkClicksRes.data || [],
        });
      } catch (err) {
        setAnalyticsError(err.response?.data?.message || err.message || 'Failed to load analytics data.');
        console.error("Analytics fetch error:", err);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalyticsForCard();
  }, [selectedCardId]);

  const selectedCard = userCards.find(card => card.id === selectedCardId);

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <div style={{ flex: 1 }}>
        <h2>My Cards</h2>
        {loading && <p>Loading cards...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && userCards.length === 0 && (
          <p>No cards found. <Link to="/create-card">Create your first card!</Link></p>
        )}
        {!loading && !error && userCards.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {userCards.map((card) => (
              <li
                key={card.id}
                onClick={() => handleSelectCard(card.id)}
                style={{
                  padding: '10px',
                  border: selectedCardId === card.id ? '2px solid blue' : '1px solid #ccc',
                  marginBottom: '5px',
                  cursor: 'pointer',
                }}
              >
                <strong>{card.full_name}</strong> ({card.card_slug})
                <br />
                <small>Company: {card.company_name || 'N/A'}</small><br/>
                <small>Template ID: {card.template_id}</small><br/>
                <Link to={`/c/${card.card_slug}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                  View Public Card
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ flex: 2, position: 'sticky', top: '20px', height: '90vh', overflowY: 'auto' }}>
        {selectedCard ? (
          <>
            <h3>Analytics for Card: {selectedCard.full_name} ({selectedCard.card_slug})</h3>
            {analyticsLoading && <p>Loading analytics...</p>}
            {analyticsError && <p style={{color: 'red'}}>Error: {analyticsError}</p>}
            {!analyticsLoading && !analyticsError && (
              <div>
                <section style={{ marginBottom: '15px', padding: '10px', border: '1px dashed #eee' }}>
                  <h4>Daily Visitors</h4>
                  {selectedCardAnalytics.visitors && selectedCardAnalytics.visitors.length > 0 ? (
                    <ul>
                      {selectedCardAnalytics.visitors.map((v, index) => (
                        <li key={index}>{v.date}: {v.unique_visitors} unique visitors</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No visitor data yet.</p>
                  )}
                </section>

                <section style={{ marginBottom: '15px', padding: '10px', border: '1px dashed #eee' }}>
                  <h4>Messages Received ({selectedCardAnalytics.messages?.length || 0})</h4>
                  {selectedCardAnalytics.messages && selectedCardAnalytics.messages.length > 0 ? (
                    <ul style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {selectedCardAnalytics.messages.map((msg, index) => (
                        <li key={index}>
                          <strong>From:</strong> {msg.sender_name || 'N/A'} ({msg.sender_email || 'N/A'})<br/>
                          <strong>Message:</strong> {msg.message_content}<br/>
                          <strong>Received:</strong> {new Date(msg.received_at).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No messages received yet.</p>
                  )}
                </section>

                <section style={{ marginBottom: '15px', padding: '10px', border: '1px dashed #eee' }}>
                  <h4>Appointments Booked ({selectedCardAnalytics.appointments?.length || 0})</h4>
                  {selectedCardAnalytics.appointments && selectedCardAnalytics.appointments.length > 0 ? (
                     <ul style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {selectedCardAnalytics.appointments.map((app, index) => (
                        <li key={index}>
                          <strong>Requester:</strong> {app.requester_name} ({app.requester_email})<br/>
                          <strong>Proposed Time:</strong> {app.proposed_time}<br/>
                          <strong>Requested:</strong> {new Date(app.created_at).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No appointments booked yet.</p>
                  )}
                </section>

                <section style={{ marginBottom: '15px', padding: '10px', border: '1px dashed #eee' }}>
                  <h4>Link/QR Clicks ({selectedCardAnalytics.link_clicks?.length || 0})</h4>
                  {selectedCardAnalytics.link_clicks && selectedCardAnalytics.link_clicks.length > 0 ? (
                    <ul style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {selectedCardAnalytics.link_clicks.map((click, index) => (
                        <li key={index}>
                          <strong>Type:</strong> {click.link_type}<br/>
                          <strong>URL:</strong> {click.link_url}<br/>
                          <strong>Clicked At:</strong> {new Date(click.clicked_at).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No link clicks recorded yet.</p>
                  )}
                </section>
              </div>
            )}
          </>
        ) : (
          <p>Select a card to view its analytics.</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
