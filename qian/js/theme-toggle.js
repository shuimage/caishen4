// 主题切换功能 - 独立脚本，确保DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 检查localStorage中的主题偏好
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
  }
  
  // 主题切换按钮事件监听
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-theme');
      // 保存主题偏好到localStorage
      const isDarkTheme = document.body.classList.contains('dark-theme');
      localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    });
  }
});