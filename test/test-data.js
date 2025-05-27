const testCases = [
  {
    input: '{{הערה|{{קישור כללי|כותרת=בריכת דורה - שלולית חורף בנתניה - חדרה וקיסריה {{!}} טיולי|אתר=אתר טיולי|כתובת=https://www.tiuli.com/points-of-interest/356/בריכת-דורה-שלולית-חורף-בנתניה|שפה=he|תאריך_וידוא=2021-01-14|הכותב=אתר טיולי}}}}',
    expected: '<ref>{{Cite web |title=בריכת דורה - שלולית חורף בנתניה - חדרה וקיסריה {{!}} טיולי |url=https://www.tiuli.com/points-of-interest/356/בריכת-דורה-שלולית-חורף-בנתניה |author=אתר טיולי |access-date=2021-01-14 |website=אתר טיולי |language=he}}</ref>'
  },
  {
    input: '<ref>{{קישור כללי|כתובת=https://moreshet.netanya.muni.il/sites/sitepage/?itemId=1353|כותרת=נתניה {{!}} עיר ימים|אתר=moreshet.netanya.muni.il|שפה=he|תאריך_וידוא=2022-01-13}}</ref>',
    expected: '<ref>{{Cite web |title=נתניה {{!}} עיר ימים |url=https://moreshet.netanya.muni.il/sites/sitepage/?itemId=1353 |access-date=2022-01-13 |website=moreshet.netanya.muni.il |language=he}}</ref>'
  },
  {
    input: '<ref>{{קישור כללי|כתובת=http://www.halat.co.il/html5/arclookup.taf?&did=2300&_id=28880&g=12156&SM=13153|כותרת=עיר ימים|אתר=www.halat.co.il|שפה=HE|תאריך_וידוא=2022-01-13}}</ref>',
    expected: '<ref>{{Cite web |title=עיר ימים |url=http://www.halat.co.il/html5/arclookup.taf?&did=2300&_id=28880&g=12156&SM=13153 |access-date=2022-01-13 |website=www.halat.co.il |language=HE}}</ref>'
  },
  {
    input: '<ref>{{קישור כללי|כתובת=https://michaelarch.wordpress.com/2016/10/29/סיבוב-בשכונת-עיר-ימים-בנתניה/|הכותב=מיכאל יעקובסון|כותרת=סיבוב בשכונת עיר ימים בנתניה|אתר=חלון אחורי|תאריך=2016-10-29|שפה=he-IL|תאריך_וידוא=2022-01-13}}</ref>',
    expected: '<ref>{{Cite web |title=סיבוב בשכונת עיר ימים בנתניה |url=https://michaelarch.wordpress.com/2016/10/29/סיבוב-בשכונת-עיר-ימים-בנתניה/ |author=מיכאל יעקובסון |access-date=2022-01-13 |website=חלון אחורי |language=he-IL}}</ref>'
  },
  {
    input: '{{הערה|{{כלכליסט|בשיתוף: גינדי החזקות|שכונת עיר ימים בנתניה משנה את חוקי המשחק בנדל"ן באזור השרון|3740764|21 ביוני 2018}}}}',
    expected: '<ref>{{Cite web |title=שכונת עיר ימים בנתניה משנה את חוקי המשחק בנדל"ן באזור השרון |url=https://www.calcalist.co.il/local/articles/0,7340,L-3740764,00.html |author=בשיתוף: גינדי החזקות |date=21 June 2018 |website=Calcalist |language=he}}</ref>'
  },
  {
    input: '{{כלכליסט|בשיתוף: גינדי החזקות|שכונת עיר ימים בנתניה משנה את חוקי המשחק בנדל"ן באזור השרון|3740764|21 ביוני 2018}}',
    expected: '{{Cite web |title=שכונת עיר ימים בנתניה משנה את חוקי המשחק בנדל"ן באזור השרון |url=https://www.calcalist.co.il/local/articles/0,7340,L-3740764,00.html |author=בשיתוף: גינדי החזקות |date=21 June 2018 |website=Calcalist |language=he}}'
  },
  {
    input: '{{הערה|{{ערוץ7|רבקי גולדפינגר|עניין אישי והפעם עם הדסה בן ארי|312182|15 בדצמבר 2015}}}}',
    expected: '<ref>{{Cite web |title=עניין אישי והפעם עם הדסה בן ארי |url=https://www.inn.co.il/news/312182 |author=רבקי גולדפינגר |date=15 December 2015 |website=ערוץ 7 |language=he}}</ref>'
  },
  {
    input: '{{הערה|{{ynet|נטע סלע|"לכתוב ליד שם התלמידה: אשכנזיה או מזרחית"|3296619|31 באוגוסט 2006}}}}',
    expected: '<ref>{{Cite web |title="לכתוב ליד שם התלמידה: אשכנזיה או מזרחית" |url=https://www.ynet.co.il/articles/1,7340,L-3296619,00.html |author=נטע סלע |date=31 August 2006 |website=ynet |language=he}}</ref>'
  }
];