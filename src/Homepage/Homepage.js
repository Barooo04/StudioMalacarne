import React, { useRef, useEffect, useState } from 'react';
import './Homepage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faArrowRight, faArrowUp, faBars, faTimes, faEnvelope, faMapMarkerAlt, faUserDoctor, faPills, faHammer, faPlane, faCar, faSmoking, faGlobe, faHouse, faHome, faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faBitcoin, faInstagram } from '@fortawesome/free-brands-svg-icons';
import ReactMarkdown from 'react-markdown';

import teamMember1 from '../Images/MM-nosfondo.png';
import teamMember2 from '../Images/SM-nosfondo.png';
//import logo from '../Images/sm-reverse.png';
import logo from '../Images/logoM2.png';
import logo3 from '../Images/logoM1.png';
import studioPonsacco from '../Images/studioPonsacco.png';
import studioCastelfranco from '../Images/studioCastelfranco.png';

const Homepage = () => {
  const chatInputRef = useRef(null);
  const servicesSectionRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, text: "Ciao! Come posso aiutarti oggi?", isAssistant: true }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const API = "https://servermalacarne.onrender.com";

  const scrollToBottom = () => {
    const messageContainer = document.querySelector('.chat-messages');
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Effetto per scrollare automaticamente quando vengono aggiunti nuovi messaggi
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const extractText = (content) => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content.map(item => item.text || item).join('\n');
    }
    return JSON.stringify(content);
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    setIsChatActive(true);
    setMessages(prev => [...prev, { 
      id: prev.length + 1, 
      text: message, 
      isAssistant: false
    }]);

    setIsTyping(true);
    setShowQuickQuestions(false);

    try {
      let currentThreadId = threadId;
      
      // Prima creiamo una sessione se non esiste
      if (!currentThreadId) {
        console.log("Creazione nuova sessione con messaggio:", message);
        const sessionResponse = await fetch(`${API}/conversation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: message })
        });

        if (!sessionResponse.ok) {
          throw new Error("Errore nella creazione della sessione");
        }

        const sessionData = await sessionResponse.json();
        console.log("Risposta creazione sessione:", sessionData);
        currentThreadId = sessionData.threadId;
        setThreadId(currentThreadId);
      }

      console.log("Invio messaggio con threadId:", currentThreadId);
      console.log("Contenuto messaggio:", message);
      
      // Poi inviamo il messaggio
      const conv = await fetch(`${API}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          threadId: currentThreadId, 
          message: message 
        })
      });

      if (!conv.ok) {
        throw new Error("Errore nella risposta del server");
      }

      const response = await conv.json();
      console.log("Risposta completa dal server:", response);

      // Troviamo l'ultimo messaggio dell'assistente
      const assistantMessage = response.messages.find(msg => msg.role === 'assistant');
      console.log("Messaggio dell'assistente:", assistantMessage);

      if (assistantMessage) {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          id: prev.length + 1, 
          text: extractText(assistantMessage.content[0]?.text?.value || assistantMessage.content), 
          isAssistant: true
        }]);

        // Analisi della conversazione
        console.log("Invio messaggi per analisi:", response.messages);
        const info = await fetch(`${API}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            threadId: currentThreadId,
            messages: response.messages.map(msg => ({
              role: msg.role,
              content: typeof msg.content === 'string' ? msg.content : 
                      Array.isArray(msg.content) ? msg.content[0]?.text?.value || '' :
                      msg.content?.text?.value || ''
            }))
          })
        });

        let infoData;
        try {
          const text = await info.text(); // Prima otteniamo il testo della risposta
          console.log('Risposta raw dal server:', text); // Log per debug
          infoData = JSON.parse(text); // Poi proviamo a parsarlo
        } catch (error) {
          console.error('Errore nel parsing della risposta:', error);
          return;
        }

        console.log("Risultato analisi:", infoData);

        // Se la risposta è 'finished', termina la conversazione
        if (infoData.status === 'finished') {
          // Mostra il messaggio di ringraziamento
          setMessages(prev => [...prev, { 
            id: prev.length + 1, 
            text: "Grazie per averci contattato! Ti risponderemo al più presto.", 
            isAssistant: true
          }]);

          // Disabilita completamente la chat
          setIsChatActive(false);
          setShowQuickQuestions(false);
          
          // Disabilita l'input
          if (chatInputRef.current) {
            chatInputRef.current.disabled = true;
          }
          
          return;
        }

        // Se non è 'finished', continua con la conversazione
        if (infoData && typeof infoData === 'object') {
          const allFieldsFilled = Object.values(infoData).every(value => 
            value && (typeof value === 'string' ? value.trim() !== '' : true)
          );
          
          if (allFieldsFilled) {
            // Invia i dati per email
            try {
              await fetch(`${API}/send-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  to: 'simone@example.com',
                  subject: 'Nuovo contatto dal sito',
                  data: infoData
                })
              });
            } catch (error) {
              console.error("Errore nell'invio dell'email:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Errore:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: prev.length + 1, 
        text: "Mi dispiace, si è verificato un errore. Riprova più tardi.", 
        isAssistant: true
      }]);
    }

    scrollToBottom();
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleDescriptionClick = () => {
    chatInputRef.current.focus();
  };

  const scrollTo = (sectionId) => {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Array dei servizi (ordinati per lunghezza descrizione, dalle più lunghe alle più corte)
  const services = [
    {
      id: 1,
      title: "Tenuta della contabilità",
      description: "Sistemi digitali evoluti per fornire report e analisi per aiutare l'imprenditore a capire davvero l'andamento della propria attività."
    },
    {
      id: 2,
      title: "Gestione del personale dipendente",
      description: "Un supporto concreto nella gestione dei rapporti col personale per prevenire criticità che potrebbero trasformarsi in problemi più seri."
    },
    {
      id: 3,
      title: "Consulenza fiscale e societaria",
      description: "Un affiancamento costante per la gestione di tutti gli adempimenti fiscali, per ridurre i rischi, cogliere le opportunità normative e prevenire situazioni critiche. Un supporto nella scelta della forma giuridica più adatta in ottica fiscale, per una tutela patrimoniale dei soggetti coinvolti."
    },
    {
      id: 4,
      title: "Analisi finanziaria e business plan",
      description: "La fotografia della situazione economica e patrimoniale dell'impresa come base numerica solida per ogni decisione strategica dell'imprenditore. Previsione di scenari e valutazione di investimenti per sostenere decisioni consapevoli e lungimiranti prima di avviare un nuovo progetto o investimento, evitando errori costosi e massimizzando le possibilità di successo."
    },
    {
      id: 5,
      title: "Operazioni straordinarie",
      description: "Competenze tecniche e visione d'insieme per strutturare e gestire fusioni, scissioni, trasformazioni, cessioni e acquisizioni garantendo sicurezza, trasparenza e coerenza con gli obiettivi aziendali e personali."
    },
    {
      id: 6,
      title: "Revisione legale",
      description: "Rigore, indipendenza e attenzione al dettaglio per fornire un giudizio obiettivo e affidabile delle informazioni economico-finanziarie delle imprese, a tutela di soci, stakeholder e investitori."
    }
  ];

  return (
    <div className="homepage-container" id="hero-container">
      <div className="navbar">
        <div className='navbar-nav'>
          <div className="navbar-logo" onClick={() => scrollTo('hero-container')}>
            <img src={logo} alt="Studio Malacarne Logo" />
          </div>
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>
          <div className="navbar-links">
            <p onClick={() => scrollTo('hero-container')}>Home</p>
            <p onClick={() => scrollTo('chi-siamo-container')}>Chi Siamo</p>
            <p onClick={() => scrollTo('services-section')}>I nostri servizi</p>
            <p onClick={() => scrollTo('lo-studio-container')}>Lo Studio</p>
            <p onClick={() => scrollTo('contatti-container')}>Contatti</p>
          </div>
          <div className="navbar-button" onClick={() => scrollTo('contatti-container')}>
            <FontAwesomeIcon icon={faWhatsapp} />
            <p className="navbar-button-text">Scrivici!</p>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay active" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="navbar-links mobile-menu-open" onClick={(e) => e.stopPropagation()}>
            <p onClick={() => {scrollTo('hero-container'); setIsMobileMenuOpen(false);}}>Home</p>
            <p onClick={() => {scrollTo('chi-siamo-container'); setIsMobileMenuOpen(false);}}>Chi Siamo</p>
            <p onClick={() => {scrollTo('services-section'); setIsMobileMenuOpen(false);}}>I nostri servizi</p>
            <p onClick={() => {scrollTo('lo-studio-container'); setIsMobileMenuOpen(false);}}>Lo Studio</p>
            <p onClick={() => {scrollTo('contatti-container'); setIsMobileMenuOpen(false);}}>Contatti</p>
            <a
              className="mobile-whatsapp-btn"
              href="https://wa.me/393331234567"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faWhatsapp} />
              <span>Scrivici su WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      <div className="hero-container">
        <div className={`hero-content ${isChatActive ? 'chat-active' : ''}`}>
          <img src={logo3} alt="Studio Malacarne Logo Esteso" className="hero-logo" />
          <p className="title">STUDIO MALACARNE</p>
          <p className="subtitle">Affidabilità e Competenza per la Tua Attività</p>
          <p className="description" onClick={handleDescriptionClick}>
            Domande? Chiedi pure <FontAwesomeIcon icon={faArrowRight} size="sm" style={{margin: '0', padding: '0'}}/>
          </p>
        </div>
        <div className={`chat-background  ${isChatActive ? 'chat-active' : ''}`}></div>
        <div className={`hero-chat ${isChatActive ? 'chat-active' : ''}`}>
          <div className="chat-messages" >
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.isAssistant ? 'assistant' : 'user'}`}>
                {message.isAssistant ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  message.text
                )}
              </div>
            ))}
            {isTyping && (
              <div className="message assistant typing-indicator">
                <span className="thinking-text">Sto pensando</span>
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            {showQuickQuestions && (
              <div className="quick-questions">
                <p className="quick-questions-title">Domande Frequenti:</p>
                <div className="quick-questions-buttons">
                  <button onClick={() => handleQuickQuestion("Cosa è un forfettario?")}>
                    Cosa è un forfettario?
                  </button>
                  <button onClick={() => handleQuickQuestion("Vorrei aprire un'attività")}>
                    Vorrei aprire un'attività
                  </button>
                  <button onClick={() => handleQuickQuestion("Quali sono i servizi che offrite?")}>
                    Quali sono i servizi che offrite?
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-container">
            <input 
              ref={chatInputRef}
              type="text" 
              placeholder="Scrivi un messaggio..." 
              className="chat-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button 
              className="chat-send"
              onClick={() => {
                handleSendMessage(chatInputRef.current.value);
                chatInputRef.current.value = '';
              }}
            >
              Invia
            </button>
          </div>
        </div>
      </div>

      <div className="chi-siamo-container" id="chi-siamo-container">
        <div className="chi-siamo-content">
          <h2 className="chi-siamo-title">Chi Siamo</h2>
          <p className="chi-siamo-text">
            Lo Studio Malacarne assiste gli imprenditori offrendo un supporto concreto e qualificato nella gestione della loro attività.
            <br /><br />
            La filosofia dello Studio si fonda su due principi essenziali:
            <br />
            1. fornire strumenti chiari per comprendere, analizzare e sviluppare la propria impresa con consapevolezza.
            <br />
            2. rendere la gestione aziendale semplice ed efficiente, liberando l'imprenditore dal peso degli adempimenti e permettendogli di concentrarsi pienamente sulla crescita del proprio business.
            <br /><br />
            L'esperienza maturata in oltre vent'anni di attività consente allo Studio Malacarne di essere un punto di riferimento affidabile per chi desidera un partner professionale capace di trasformare la complessità amministrativa in valore e chiarezza gestionale.
          </p>
        </div>
        <div className="chi-siamo-image">
          <div className="team-member">
            <div className="image-container">
              <img src={teamMember1} alt="Team member 1" />
            </div>
            <h3>Dott. Marco Malacarne</h3>
            <p>Laureato in Economia e Commercio presso l'università di Pisa, specializzato in consulenza aziendale, analisi finanziaria e gestione del personale</p>
          </div>
          <div className="team-member">
            <div className="image-container">
              <img src={teamMember2} alt="Team member 2" />
            </div>
            <h3>Dott. Simone Malacarne</h3>
            <p>Laureato in Economia e Commercio presso l'università di Pisa, specializzato in consulenza societaria, operazioni straordinarie e revisione legale</p>
          </div>
        </div>
      </div>

      {/* Sezione I nostri servizi */}
      <div className="services-section" id="services-section" ref={servicesSectionRef}>
        <div className="services-content">
          <h2 className="services-title">I nostri servizi</h2>
          <div className="services-description">
            <p>
              Offriamo un'ampia gamma di servizi professionali per supportare le aziende in ogni aspetto della loro attività. 
              La nostra esperienza e competenza ci permettono di fornire soluzioni personalizzate che rispondono alle esigenze specifiche di ogni cliente.
            </p>
          </div>
          
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

        <div className="lo-studio-container" id="lo-studio-container">
          <div className="lo-studio-content">
            <h2 className="lo-studio-title">Lo Studio</h2>
            <p className="lo-studio-text">
              Due sedi, un'unica visione per accompagnare imprenditori e professionisti con consulenza su misura nel loro percorso di crescita
            </p>
          </div>
          <div className="lo-studio-castelfranco">
            <img 
              src={studioCastelfranco} 
              alt="Studio Castelfranco" 
              className="studio-image"
            />
            <div className="studio-content studio-content-castelfranco">
              <h2 className="studio-title">Castelfranco Di Sotto</h2>
              <p className="studio-intro">
                Lo Studio Malacarne nasce a Castelfranco di Sotto, nel cuore del comprensorio del cuoio. Un contesto unico, che ha formato la nostra esperienza e ci ha insegnato il valore della precisione, della competenza e del lavoro ben fatto.
              </p>
              <div className="studio-info">
                <p className="studio-address">
                  Piazza XX Settembre n.11 – 56020 Castelfranco Di Sotto (PI)
                </p>
                <p className="studio-hours">
                  Orario: 9:00 – 13:00  15:00 – 19:00
                </p>
                <p className="studio-phone-text">
                  Tel: <a href="tel:+390571489029">0571 489029</a>
                </p>
                <p className="studio-email-text">
                  <a href="mailto:cf@studiomalacarne.com">cf@studiomalacarne.com</a>
                </p>
              </div>
              <div className="studio-links">
                <a href="tel:+390571489029" className="studio-link">
                <FontAwesomeIcon icon={faPhone} />
                  Chiamami
                </a>
                <a href="https://wa.me/390571489029" target="_blank" rel="noreferrer" className="studio-link">
                  <FontAwesomeIcon icon={faWhatsapp} />
                  WhatsApp
                </a>
                <a href="https://www.google.com/maps/search/?api=1&query=Piazza+XX+Settembre+11+Castelfranco+Di+Sotto+PI" target="_blank" rel="noreferrer" className="studio-link">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  Naviga
                </a>
                <a href="mailto:cf@studiomalacarne.com" className="studio-link">
                  <FontAwesomeIcon icon={faEnvelope} />
                  Email
                </a>
              </div>
            </div>
          </div>

          <div className="lo-studio-ponsacco">
            <img 
              src={studioPonsacco} 
              alt="Studio Ponsacco" 
              className="studio-image"
            />
            <div className="studio-content studio-content-ponsacco">
              <h2 className="studio-title">Ponsacco</h2>
              <p className="studio-intro">
                A Ponsacco, storica città del mobile, offriamo consulenza a imprese e professionisti che affrontano un mercato in evoluzione, aiutandoli a rinnovarsi e a costruire nuove opportunità.
              </p>
              <div className="studio-info">
                <p className="studio-address">
                  Via Togliatti n.5 – 56038 Ponsacco (PI)
                </p>
                <p className="studio-hours">
                  Orario: 8:30 – 12:30  15:00 – 19:00
                </p>
                <p className="studio-phone-text">
                  Tel: <a href="tel:+390587732559">0587 732559</a>
                </p>
                <p className="studio-email-text">
                  <a href="mailto:ponsacco@studiomalacarne.com">ponsacco@studiomalacarne.com</a>
                </p>
              </div>
              <div className="studio-links">
                <a href="tel:+390587732559" className="studio-link">
                <FontAwesomeIcon icon={faPhone} />
                  Chiamami
                </a>
                <a href="https://wa.me/390587732559" target="_blank" rel="noreferrer" className="studio-link">
                  <FontAwesomeIcon icon={faWhatsapp} />
                  WhatsApp
                </a>
                <a href="https://www.google.com/maps/search/?api=1&query=Via+Togliatti+5+Ponsacco+PI" target="_blank" rel="noreferrer" className="studio-link">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  Naviga
                </a>
                <a href="mailto:ponsacco@studiomalacarne.com" className="studio-link">
                  <FontAwesomeIcon icon={faEnvelope} />
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="specializzazioni-container" id="specializzazioni-container">
          <div className="specializzazioni-content">
            <h2 className="specializzazioni-title">Le Nostre Specializzazioni</h2>
            <p className="specializzazioni-intro">
              Non tutte le aziende sono uguali. Ogni settore richiede competenze specifiche e un approccio dedicato. Grazie all'esperienza maturata in contesti diversi, lo Studio Malacarne offre consulenza mirata in aree dove la conoscenza delle dinamiche operative e normative fa davvero la differenza.
            </p>
            <div className="specializzazioni-grid">
              <div className="specializzazione-item">
                <div className="specializzazione-icon">
                  <FontAwesomeIcon icon={faUserDoctor} />
                </div>
                <h3 className="specializzazione-title">Medici e professioni sanitarie</h3>
              </div>
              <div className="specializzazione-item">
                <div className="specializzazione-icon">
                  <FontAwesomeIcon icon={faPills} />
                </div>
                <h3 className="specializzazione-title">Farmacie</h3>
              </div>
              <div className="specializzazione-item">
                <div className="specializzazione-icon">
                  <FontAwesomeIcon icon={faHammer} />
                </div>
                <h3 className="specializzazione-title">Edilizia</h3>
              </div>
              <div className="specializzazione-item">
                <div className="specializzazione-icon">
                  <FontAwesomeIcon icon={faPlane} />
                </div>
                <h3 className="specializzazione-title">Agenzie di viaggio</h3>
              </div>
              <div className="specializzazione-item">
                <div className="specializzazione-icon">
                  <FontAwesomeIcon icon={faCar} />
                </div>
                <h3 className="specializzazione-title">Beni e autoveicoli usati</h3>
              </div>
              <div className="specializzazione-item">
                <div className="specializzazione-icon">
                  <FontAwesomeIcon icon={faSmoking} />
                </div>
                <h3 className="specializzazione-title">Tabacchi</h3>
              </div>
              <div className="specializzazione-item">
                <div className="specializzazione-icon">
                  <FontAwesomeIcon icon={faInstagram} />
                </div>
                <h3 className="specializzazione-title">Influencer</h3>
              </div>
              <div className="specializzazione-item">
                <div className="specializzazione-icon">
                  <FontAwesomeIcon icon={faBitcoin} />
                </div>
                <h3 className="specializzazione-title">Criptovalute</h3>
              </div>
              <div className="specializzazione-item">
                <div className="specializzazione-icon">
                  <FontAwesomeIcon icon={faGlobe} />
                </div>
                <h3 className="specializzazione-title">Commercio con l'estero</h3>
              </div>
              <div className="specializzazione-item">
                <div className="specializzazione-icon">
                  <FontAwesomeIcon icon={faHouse} />
                </div>
                <h3 className="specializzazione-title">Affitti brevi e locazioni turistiche</h3>
              </div>
              <div className="specializzazione-item">
                <div className="specializzazione-icon">
                  <FontAwesomeIcon icon={faHome} />
                </div>
                <h3 className="specializzazione-title">Lavoro domestico</h3>
              </div>
              <div className="specializzazione-item">
                <div className="specializzazione-icon">
                  <FontAwesomeIcon icon={faFileInvoice} />
                </div>
                <h3 className="specializzazione-title">Contribuenti forfettari</h3>
              </div>
            </div>
          </div>
        </div>

      {showScrollTop && (
        <div className="scroll-to-top" onClick={scrollToTop}>
          <FontAwesomeIcon icon={faArrowUp} />
        </div>
      )}

      <footer className="footer" id="contatti-container">
        <div className="footer-container">
          <div className="footer-section">
            <img src={logo} alt="Studio Malacarne" className="footer-logo" />
            <form className="footer-contact-form">
              <input 
                type="text" 
                placeholder="Nome" 
                className="footer-input" 
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="footer-input" 
              />
              <textarea 
                placeholder="Messaggio" 
                className="footer-input footer-textarea"
              ></textarea>
              <button type="submit" className="footer-submit">
                Invia Messaggio
              </button>
            </form>
          </div>

          <div className="footer-section footer-locations">
            <div className="location">
              <h3 className="location-title">Castelfranco</h3>
              <div className="location-info">
                <p>Piazza XX Settembre n.11 – 56020 Castelfranco Di Sotto (PI)</p>
                <p>Tel: <a href="tel:+390571489029" style={{color: 'inherit'}}>0571 489029</a></p>
                <p>Email: <a href="mailto:cf@studiomalacarne.com" style={{color: 'inherit'}}>cf@studiomalacarne.com</a></p>
                <p>Orario: 9:00 – 13:00  15:00 – 19:00</p>
              </div>
              <iframe 
                src="https://www.google.com/maps?q=Piazza+XX+Settembre+11+Castelfranco+Di+Sotto+PI&output=embed" 
                className="location-map" 
                title="Sede Castelfranco"
                loading="lazy"
              ></iframe>
            </div>
          </div>

          <div className="footer-section footer-locations">
            <div className="location">
              <h3 className="location-title">Ponsacco</h3>
              <div className="location-info">
                <p>Via Togliatti n.5 – 56038 Ponsacco (PI)</p>
                <p>Tel: <a href="tel:+390587732559" style={{color: 'inherit'}}>0587 732559</a></p>
                <p>Email: <a href="mailto:ponsacco@studiomalacarne.com" style={{color: 'inherit'}}>ponsacco@studiomalacarne.com</a></p>
                <p>Orario: 8:30 – 12:30  15:00 – 19:00</p>
              </div>
              <iframe 
                src="https://www.google.com/maps?q=Via+Togliatti+5+Ponsacco+PI&output=embed" 
                className="location-map" 
                title="Sede Ponsacco"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Studio Malacarne. Tutti i diritti riservati. | P.IVA 01234567890</p>
          <p>Powered by <a href="https://www.webbitz.it" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'white'}}>Webbitz</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage; 