async function fyfy() {
  const response = await fetch('https://unpkg.com/turndown/dist/turndown.js');
  const txt = await response.text();
  let se = document.createElement('script');
  se.type = 'text/javascript';
  se.text = txt;
  document.getElementsByTagName('head')[0].appendChild(se);
  let turndownService = new TurndownService();

  let url = document.URL;
  let title, desc = '';
  let author, date, infos;

  if(url.startsWith('https://learning.oreilly.com/library/view/')) {
    title  = document.querySelector('h1').innerText;
    author = document.querySelector('div.author').innerText;
    desc = document.querySelector('div.issued').innerText + '\n' + document.querySelector('div.isbn').innerText;
    desc += '\n\n' + turndownService.turndown(document.querySelector('div.description div').innerHTML);

    desc = "[오라일리 사파리](" + url + ") \n" + author + "\n\n" + desc;
  }
  else if(url.indexOf('pragprog.com/book/') > -1) {
    title = document.getElementsByTagName('h1')[0].innerText;
    author = document.querySelector('span[itemprop=author]').innerText;
    desc = document.querySelector('article[itemprop=description]').innerText;
    
    desc = '[프래그매틱 링크](' + url + ') \nby ' + author + '\n\n';
    desc += document.querySelector('div[class$=book-details]').innerText + '\n' + 
            document.querySelector('article[itemprop=description]').innerText + '\n\n###목차\n\n';
    infos = Array.from(document.querySelectorAll('article[id=toc]>ul>li'));
    infos.forEach((item) => { desc += '- ' + item.innerText.split('\n')[0] + '\n' });
  }
  else if(url.indexOf('.packtpub.') > -1) {
    title = document.getElementsByTagName('h1')[0].innerText;
    author = document.getElementsByClassName('book-top-block-info-authors left')[0].innerText.trim().split('\n')[0];
    date = document.getElementsByClassName('book-top-block-info-authors left')[0].innerText.trim().split('\n')[1];

    desc = "[팩트 링크](" + url + ") \nby " + author + "\n\n\n";
    desc += document.getElementsByClassName('book-info-details onlyDesktop')[0].innerText + '\n' + date + '\n\n\n';
    desc += document.getElementsByClassName('book-info-bottom-indetail book-page-content float-right')[0].innerText;
  }
  else if(url.indexOf('.manning.') > -1) {
    title = document.head.querySelector("[name=application-name]").content;
    author = document.getElementsByClassName('product-authorship')[0].innerText.trim().split('\n')[0];

    desc = "[매닝 링크](" + url + ") \nby " + author + "\n\n";
    desc += [...document.getElementsByClassName('product-info')[0].querySelectorAll('li')].map(el => '- ' + el.innerText.trim()).join('\n');
    
    let quotes = document.getElementsByClassName('large-book-quote');
    if(quotes.length > 0)
      desc += '\n\n> ' + quotes[0].innerText.replace(/\n/g, '\n> ');
    desc += '\n\n' + document.querySelector('div.description-body').innerText;
    desc += '\n\n###' + document.querySelector('div.header').childNodes[0].textContent.trim();
    desc += '\n\n' + [...document.querySelector('div.toc').children].map(el => el.innerText.replace('READ IN LIVEBOOK\n', '').replace(/(^\d+) /, '$1\. ')).join('\n');
  }
  else if(url.indexOf('.amazon.') > -1) {
    // prettify URL
    let pathArray = document.URL.split( '/' );
    let protocol = pathArray[0];
    let host = pathArray[2];

    let index;
    if(pathArray.indexOf('product') > -1) index = pathArray.indexOf('product') + 1;
    else if(pathArray.indexOf('dp') > -1) index = pathArray.indexOf('dp') + 1;
    else if(pathArray.indexOf('d') > -1) index = pathArray.indexOf('d') + 1;
    else if(pathArray.indexOf('ASIN') > -1) index = pathArray.indexOf('ASIN') + 1;
    if(index === undefined) alert('URL을 정규화할 수 없습니다. 만든 이에게 제보해주세요.' );

    let asin = pathArray[index];
    if(asin.indexOf('?') > -1) asin = asin.slice(0, asin.indexOf('?'));
    url = protocol + '//' + host + '/dp/' + asin;

    title = document.getElementById('title').innerText;
    author = document.getElementById('bylineInfo');
    if(author === null) author = '';
    else author = author.innerText;

    desc = document.querySelector('td.bucket>div.content').innerText.replace(/\n\#/g, "\n\n- \\#");
    let subIdx = desc.lastIndexOf('- \\#');
    let sub = desc.slice(subIdx).replace("\n", "\n\n");
    desc = desc.slice(0, subIdx) + sub;

    desc = "[아마존 링크](" + url + ") \n" + author + "\n\n" + desc;

    if(desc.indexOf('언어 : 일본어') > -1) {
      let toc = document.querySelectorAll('td.bucket>div.content li');
      if(toc[toc.length-1].innerText == '목차보기')
        desc = desc.replace('목차보기', turndownService.turndown(toc[toc.length-1].innerHTML));

      let matches = desc.match(/^\d+ 위 ─.+$/gm);
      if(matches) matches.forEach(li => {
        desc = desc.replace(li, '\n- ' + li);
      });

      desc += '\n\n원제 : ' + document.head.querySelector('meta[name="title"]').content.split(' | ')[0];
    }
    else if(desc.indexOf('언어 : 영어') > -1) {
      let metaDesc = document.head.querySelector('meta[name="description"]').content;
      if(metaDesc.indexOf(' [') > -1) metaDesc = metaDesc.split(' [')[0];
      else metaDesc = metaDesc.split(' on Amazon')[0];

      desc += '\n\n원제 : ' + metaDesc;
    }
  }
  else {
    title = document.title;
    if(title === '') title = url;
    desc = '';
  }

  return [url, title, desc];
}