import React from 'react'

function AboutPage() {
  return (
    <div>
    <header>
      <h1>关于我们</h1>
    </header>
    <section className="about">
      <img alt="我们的团队" />
      <div className="content">
        <h2>我们的使命</h2>
        <p>我们致力于用技术改变世界，创造更美好的未来。我们的团队由一群充满激情的开发者、设计师和产品经理组成。</p>
      </div>
    </section>
    <footer>
      <p>&copy; 2025 DreamCatcher. 版权所有。</p>
    </footer>
  </div>
  )
}

export default AboutPage
