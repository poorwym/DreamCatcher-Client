import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
    return (
      <div className="about-container">
        <div className="about-content">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-left">
              <h1 className="about-title">关于我们</h1>
              <p className="hero-subtitle">创新 · 专业 · 卓越</p>
              <div className="hero-description">
                <p>我们是一个充满激情的团队，致力于为用户提供最优质的服务。</p>
                <p>通过不断创新和改进，我们希望能为每一位用户带来更好的体验。</p>
              </div>
            </div>
            <div className="hero-right">
              <div className="stats-section">
                <div className="stat-item">
                  <div className="stat-icon">◈</div>
                  <div className="stat-number">100+</div>
                  <div className="stat-label">项目完成</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">●</div>
                  <div className="stat-number">4</div>
                  <div className="stat-label">团队成员</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">◉</div>
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">服务支持</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">◎</div>
                  <div className="stat-number">3年+</div>
                  <div className="stat-label">开发经验</div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="services-section">
            <h2 className="section-title">我们的服务</h2>
            <div className="services-grid">
              <div className="service-card large">
                <div className="service-icon">◐</div>
                <h3>前端开发</h3>
                <p>现代化的用户界面设计，响应式布局，优秀的用户体验。</p>
                <div className="service-tags">
                  <span className="tag">React</span>
                  <span className="tag">Vue</span>
                  <span className="tag">Angular</span>
                </div>
              </div>
              <div className="service-card">
                <div className="service-icon">◑</div>
                <h3>后端开发</h3>
                <p>稳定可靠的服务器架构。</p>
              </div>
              <div className="service-card">
                <div className="service-icon">◈</div>
                <h3>UI/UX设计</h3>
                <p>美观实用的界面设计。</p>
              </div>
              <div className="service-card tall">
                <div className="service-icon">◎</div>
                <h3>移动应用</h3>
                <p>跨平台移动应用开发，为用户提供便捷的移动端体验。</p>
                <div className="service-features">
                  <span>iOS开发</span>
                  <span>Android开发</span>
                  <span>React Native</span>
                  <span>Flutter</span>
                </div>
              </div>
              <div className="service-card wide">
                <div className="service-icon">◉</div>
                <h3>云服务部署</h3>
                <p>专业的云平台部署和运维服务，确保应用的高可用性和安全性。</p>
              </div>
            </div>
          </div>

          {/* Team Section with Staggered Layout */}
          <div className="team-section">
            <h2 className="section-title">核心团队</h2>
            <div className="team-layout">
              <div className="team-intro">
                <p>由资深开发者组成的专业团队</p>
                <div className="team-highlights">
                  <div className="highlight-item">
                    <span className="highlight-number">4</span>
                    <span className="highlight-text">核心成员</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-number">5+</span>
                    <span className="highlight-text">技术栈</span>
                  </div>
                </div>
              </div>
              
              <div className="team-grid">
                <div className="team-member primary">
                  <img src="/wym.jpg" alt="吴一墨" className="team-member-avatar"/>
                  <div className="member-info">
                    <h3>吴一墨</h3>
                    <p className="member-role">队长 | 后端架构师</p>
                    <div className="member-skills">
                      <span className="skill-tag">Java</span>
                      <span className="skill-tag">Spring</span>
                      <span className="skill-tag">MySQL</span>
                    </div>
                  </div>
                </div>
                
                <div className="team-member">
                  <img src="./wyr.jpg" alt="吴怡然" className="team-member-avatar"/>
                  <div className="member-info">
                    <h3>吴怡然</h3>
                    <p className="member-role">前端工程师</p>
                    <div className="member-skills">
                      <span className="skill-tag">React</span>
                      <span className="skill-tag">JavaScript</span>
                      <span className="skill-tag">CSS</span>
                    </div>
                  </div>
                </div>
                
                <div className="team-member">
                  <img src="./lyh.jpg" alt="李语晗" className="team-member-avatar"/>
                  <div className="member-info">
                    <h3>李语晗</h3>
                    <p className="member-role">全栈工程师</p>
                    <div className="member-skills">
                      <span className="skill-tag">Vue</span>
                      <span className="skill-tag">TypeScript</span>
                      <span className="skill-tag">Node.js</span>
                    </div>
                  </div>
                </div>
                
                <div className="team-member">
                  <img src="/yj.jpg" alt="俞婧" className="team-member-avatar"/>
                  <div className="member-info">
                    <h3>俞婧</h3>
                    <p className="member-role">UI/UX设计师</p>
                    <div className="member-skills">
                      <span className="skill-tag">React</span>
                      <span className="skill-tag">Design</span>
                      <span className="skill-tag">Figma</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section with Split Layout */}
          <div className="contact-section">
            <div className="contact-left">
              <h2 className="section-title">联系我们</h2>
              <p>想要了解更多信息或与我们合作？</p>
              <p>随时联系我们，我们很乐意与您交流！</p>
              
              <div className="contact-methods">
                <div className="contact-method">
                  <span className="method-icon">◎</span>
                  <div>
                    <span className="method-label">邮箱</span>
                    <span className="method-value">contact@dreamcatcher.com</span>
                  </div>
                </div>
                <div className="contact-method">
                  <span className="method-icon">◈</span>
                  <div>
                    <span className="method-label">电话</span>
                    <span className="method-value">+86 138-0000-0000</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="contact-right">
              <div className="social-links">
                <a href="https://github.com/poorwym" target="_blank" rel="noopener noreferrer" className="social-link github">
                  <span className="social-icon">◐</span>
                  <span className="social-text">GitHub</span>
                </a>
                <a href="mailto:contact@example.com" className="social-link email">
                  <span className="social-icon">◉</span>
                  <span className="social-text">Email</span>
                </a>
                <a href="#" className="social-link wechat">
                  <span className="social-icon">◑</span>
                  <span className="social-text">微信</span>
                </a>
                <a href="#" className="social-link qq">
                  <span className="social-icon">●</span>
                  <span className="social-text">QQ</span>
                </a>
              </div>
              
              <div className="contact-form">
                <h3>快速联系</h3>
                <form>
                  <input type="text" placeholder="您的姓名" />
                  <input type="email" placeholder="邮箱地址" />
                  <textarea placeholder="留言内容"></textarea>
                  <button type="submit">发送消息</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default AboutPage;
