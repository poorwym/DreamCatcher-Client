import React from 'react';
import './AboutPage.css';


const AboutPage = () => {
    return (
      <div className="about-container">
        <div className="about-content">
          <div className="title-section">
            <h1 className="about-title">关于我们</h1>
            <div className="title-decoration"></div>
          </div>
  
          <div className="about-description">
            <p>
              我们是一个充满激情的团队，致力于为用户提供最优质的服务。
              通过不断创新和改进，我们希望能为每一位用户带来更好的体验。
            </p>
          </div>
  
          <div className="stats-section">
            <div className="stat-item">
              <div className="stat-icon">✨</div>
              <div className="stat-number">100+</div>
              <div className="stat-label">项目完成</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">👥</div>
              <div className="stat-number">4</div>
              <div className="stat-label">团队成员</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🚀</div>
              <div className="stat-number">24/7</div>
              <div className="stat-label">服务支持</div>
            </div>
          </div>
  
          <div className="team-section">
            <h2>我们的团队</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-card-inner">
                  <img 
                    src="/wym.jpg" 
                    alt="吴一墨" 
                    className="team-member-avatar"
                  />
                  <div className="member-info">
                    <h3>吴一墨</h3>
                    <p className="member-role">队长 | 后端开发工程师</p>
                    <div className="member-skills">
                      <span className="skill-tag">Java</span>
                      <span className="skill-tag">Spring</span>
                      <span className="skill-tag">MySQL</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="team-member">
                <div className="member-card-inner">
                  <img 
                    src="/wyr.jpg" 
                    alt="吴怡然" 
                    className="team-member-avatar"
                  />
                  <div className="member-info">
                    <h3>吴怡然</h3>
                    <p className="member-role">前端开发工程师</p>
                    <div className="member-skills">
                      <span className="skill-tag">React</span>
                      <span className="skill-tag">JavaScript</span>
                      <span className="skill-tag">CSS</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="team-member">
                <div className="member-card-inner">
                  <img 
                    src="/lyh.jpg" 
                    alt="李语晗" 
                    className="team-member-avatar"
                  />
                  <div className="member-info">
                    <h3>李语晗</h3>
                    <p className="member-role">前端开发工程师</p>
                    <div className="member-skills">
                      <span className="skill-tag">Vue</span>
                      <span className="skill-tag">TypeScript</span>
                      <span className="skill-tag">Node.js</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="team-member">
                <div className="member-card-inner">
                  <img 
                    src="/yj.jpg" 
                    alt="俞婧" 
                    className="team-member-avatar"
                  />
                  <div className="member-info">
                    <h3>俞婧</h3>
                    <p className="member-role">前端开发工程师</p>
                    <div className="member-skills">
                      <span className="skill-tag">React</span>
                      <span className="skill-tag">UI/UX</span>
                      <span className="skill-tag">Design</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div className="contact-section">
            <h2>联系我们</h2>
            <div className="contact-info">
              <p>想要了解更多信息或与我们合作？</p>
              <p>随时联系我们，我们很乐意与您交流！</p>
            </div>
            <div className="social-links">
              <a href="https://github.com/poorwym" target="_blank" rel="noopener noreferrer" className="social-link github">
                <span className="social-icon">🔗</span>
                <span className="social-text">GitHub</span>
              </a>
              
              <a href="mailto:contact@example.com" className="social-link email">
                <span className="social-icon">📧</span>
                <span className="social-text">Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };
export default AboutPage;
