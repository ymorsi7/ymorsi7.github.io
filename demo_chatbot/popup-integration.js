// Popup Chat Integration
document.addEventListener('DOMContentLoaded', function() {
  // Create chat button
  const chatButton = document.createElement('div');
  chatButton.classList.add('chat-button');
  chatButton.innerHTML = '<i class="fas fa-comment"></i>';
  document.body.appendChild(chatButton);
  
  // Create chat popup
  const chatPopup = document.createElement('div');
  chatPopup.classList.add('chat-popup');
  chatPopup.style.display = 'none';
  
  // Create chat popup header
  const chatHeader = document.createElement('div');
  chatHeader.classList.add('chat-header');
  
  const chatTitle = document.createElement('div');
  chatTitle.classList.add('chat-title');
  chatTitle.textContent = "Chat with Yusuf's AI";
  
  const closeButton = document.createElement('button');
  closeButton.classList.add('chat-close');
  closeButton.innerHTML = '&times;';
  
  chatHeader.appendChild(chatTitle);
  chatHeader.appendChild(closeButton);
  
  // Create chat iframe container
  const chatFrame = document.createElement('iframe');
  chatFrame.src = '/demo_chatbot/index.html';
  chatFrame.classList.add('chat-frame');
  chatFrame.setAttribute('frameborder', '0');
  chatFrame.setAttribute('title', "Yusuf's AI Chatbot");
  
  // Assemble popup
  chatPopup.appendChild(chatHeader);
  chatPopup.appendChild(chatFrame);
  document.body.appendChild(chatPopup);
  
  // Add CSS for chat components
  const style = document.createElement('style');
  style.textContent = `
    .chat-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background-color: #3b5998;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      z-index: 999;
      font-size: 24px;
    }
    
    .chat-button:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    }
    
    .chat-popup {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background-color: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }
    
    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: linear-gradient(to right, #3b5998, #4b6a88);
      color: white;
    }
    
    .chat-title {
      font-weight: 600;
      font-size: 16px;
    }
    
    .chat-close {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      line-height: 1;
    }
    
    .chat-frame {
      flex: 1;
      width: 100%;
      border: none;
    }
    
    @media (max-width: 480px) {
      .chat-popup {
        width: 90%;
        height: 70%;
        bottom: 80px;
        right: 5%;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Add event listeners
  chatButton.addEventListener('click', function() {
    if (chatPopup.style.display === 'none') {
      chatPopup.style.display = 'flex';
    } else {
      chatPopup.style.display = 'none';
    }
  });
  
  closeButton.addEventListener('click', function() {
    chatPopup.style.display = 'none';
  });
}); 