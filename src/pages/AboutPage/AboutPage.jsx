import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">关于我们</h1>

        <div className="about-description">
          <p>
            我们是一个充满激情的团队，致力于为用户提供最优质的服务。
            通过不断创新和改进，我们希望能为每一位用户带来更好的体验。
          </p>
        </div>

        <div className="team-section">
          <h2>我们的团队</h2>
          <div className="team-grid">
            <div className="team-member">
              <img 
                src="/wym.jpg" 
                alt="吴一墨" 
                className="team-member-avatar"
              />
              <h3>吴一墨</h3>
              <p>队长 | 后端开发工程师</p>
            </div>
            <div className="team-member">
              <img 
                src="/wyr.jpg" 
                alt="吴怡然" 
                className="team-member-avatar"
              />
              <h3>吴怡然</h3>
              <p>前端开发工程师</p>
            </div>
            <div className="team-member">
              <img 
                src="/lyh.jpg" 
                alt="李语晗" 
                className="team-member-avatar"
              />
              <h3>李语晗</h3>
              <p>前端开发工程师</p>
            </div>
            <div className="team-member">
              <img 
                src="/yj.jpg" 
                alt="俞婧" 
                className="team-member-avatar"
              />
              <h3>俞婧</h3>
              <p>前端开发工程师</p>
            </div>
          </div>
        </div>

        <div className="contact-section">
          <h2>联系我们</h2>
          <div className="social-links">
            <a href="https://github.com/poorwym" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            
            <a href="mailto:contact@example.com">
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;