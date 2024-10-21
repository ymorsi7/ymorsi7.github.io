let pages = [
    { url: '', title: 'Home' },
    { url: 'dsc209r/projects/index.html', title: 'Projects' },
    { url: 'dsc209r/contact/', title: 'Contact' },
    { url: 'dsc209r/resume.html', title: 'Resume' },
    { url: 'https://github.com/YMORSI7', title: 'GITHUB!!!', external: true }
  ];
  
  let nav = document.createElement('nav');
  
  document.body.prepend(nav);
  
  const ARE_WE_HOME = document.documentElement.classList.contains('home');
  
  for (let p of pages) {
    let url = p.url;
    let title = p.title;
  
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
  
    a.classList.toggle(
      'current',
      a.host === location.host && a.pathname === location.pathname,
    );
  
    if (p.external) {
      a.target = '_blank';
    }
  
    nav.append(a);
  }
  

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select id="theme-switcher">
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>`
  );
  
  let select = document.querySelector('#theme-switcher');
  
  if ("colorScheme" in localStorage) {
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
    select.value = localStorage.colorScheme;
  }
  
  select.addEventListener('input', function (event) {
    let colorScheme = event.target.value;
    
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    
    localStorage.colorScheme = colorScheme;
  });
  