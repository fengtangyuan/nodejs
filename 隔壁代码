var rule = {
    title:'TG搜',
    host:'https://t.me',
    url:'/s/',
    searchUrl:'/',
    searchable:2,
    quickSearch:0,
    filterable:0,
    headers:{
        'User-Agent':'MOBILE_UA'
    },
    timeout:5000,
    class_name:'全部',
    class_url:'all',
    play_parse:true,
    lazy:`js:
    input = panPlay(input,playObj.flag)
    `,
    limit:6,
    推荐:`js:
        let d = [];
        pdfh = jsp.pdfh;
        pdfa = jsp.pdfa;
        pd = jsp.pd;
        var c = rule.params;
        var myUrl = input + '/s/' + c;
        let html = request(myUrl);
        let list = pdfa(html, 'div.tgme_widget_message_bubble');
        
        list.forEach(it => {
            let text = pdfh(it, '.tgme_widget_message_text&&Text');
            let title = '';
            let desc = '';
            let content = '';
            
            // 精准提取名称和描述
            if(text.includes('名称：')){
                try {
                    // 提取名称 - 在<br>之前的内容
                    title = text.split('描述：')[0].replace('名称：','').trim();
                    // 提取描述 - 在第一个<br>之后,歌曲列表之前的内容
                    content = text.split('描述：')[1].split('链接：')[0].trim();
                    desc = text.split('标签：')[1].split('👥')[0].trim();
                    
                    // 提取图片 - 直接使用style的值作为图片url
                    let img = '';
                    try{
                        img = pdfh(it, '.tgme_widget_message_photo_wrap&&style').trim();
                        // 如果获取到的是带引号的字符串，去掉引号
                        if(img.startsWith("'") && img.endsWith("'")){
                            img = img.slice(1,-1);
                        }
                    }catch(e){
                        console.log('提取图片错误:', e.message);
                    }
                    
                    // 修改链接提取部分
                    let url = '';
                    try {
                        // 获取所有链接
                        let links = pdfa(it, '.js-message_text a');
                        let urls = [];
                        // 遍历所有链接元素
                        links.forEach(link => {
                            let href = pd(link, 'a&&href', HOST);
                            if(href && !href.includes('t.me')) urls.push(href);
                        });
                        // 用逗号连接所有链接
                        url = urls.join(',');
                    } catch(e) {
                        log('提取链接错误:' + e.message);
                    }
                    
                    // 如果有链接才添加到结果中
                    if(url){
                        d.push({
                            title: title,
                            desc: desc,
                            content: content,
                            pic_url: img,
                            url: url
                        });
                    }
                } catch(e) {
                    log('处理消息出错:'+e.message);
                }
            }
        });
        setResult(d);
    `,
    double:false,
    一级:`js:
        let d = [];
        pdfh = jsp.pdfh;
        pdfa = jsp.pdfa;
        pd = jsp.pd;
        var aurl = input + rule.params;
        let before = _sparams[MY_PAGE];
        if (before){
            aurl = aurl + '?before=' + before;
        }
        let html = request(aurl);
        let list = pdfa(html, 'div.tgme_widget_message_bubble');
        
        // 获取最后一条消息的ID用于翻页
        try {
            let lastMsg = list[0];
            let dateLink = pdfh(lastMsg, '.tgme_widget_message_date&&href');
            let lastId = dateLink.split('/').pop();
            _sparams[MY_PAGE+1] = lastId;  // 存储最后一条消息ID
        } catch(e) {
            log('获取最后消息ID失败:' + e.message);
        }
        
        list.forEach(it => {
            let text = pdfh(it, '.tgme_widget_message_text&&Text');
            let title = '';
            let desc = '';
            let content = '';
            
            // 精准提取名称和描述
            if(text.includes('名称：')){
                try {
                    // 提取名称 - 在<br>之前的内容
                    title = text.split('描述：')[0].replace('名称：','').trim();
                    // 提取描述 - 在第一个<br>之后,歌曲列表之前的内容
                    content = text.split('描述：')[1].split('链接：')[0].trim();
                    desc = text.split('标签：')[1].split('👥')[0].trim();
                    
                    // 提取图片 - 直接使用style的值作为图片url
                    let img = '';
                    try{
                        img = pdfh(it, '.tgme_widget_message_photo_wrap&&style').trim();
                        // 如果获取到的是带引号的字符串，去掉引号
                        if(img.startsWith("'") && img.endsWith("'")){
                            img = img.slice(1,-1);
                        }
                    }catch(e){
                        console.log('提取图片错误:', e.message);
                    }
                    
                    // 修改链接提取部分
                    let url = '';
                    try {
                        // 获取所有链接
                        let links = pdfa(it, '.js-message_text a');
                        let urls = [];
                        // 遍历所有链接元素
                        links.forEach(link => {
                            let href = pd(link, 'a&&href', HOST);
                            if(href && !href.includes('t.me')) urls.push(href);
                        });
                        // 用逗号连接所有链接
                        url = urls.join(',');
                    } catch(e) {
                        log('提取链接错误:' + e.message);
                    }
                    
                    // 如果有链接才添加到结果中
                    if(url){
                        d.push({
                            title: title,
                            desc: desc,
                            content: content,
                            pic_url: img,
                            url: url
                        });
                    }
                } catch(e) {
                    log('处理消息出错:'+e.message);
                }
            }
        });
        setResult(d);
    `,
    二级:`js:
        let id=input;
        let urls = input.split(','); // 拆分多个URL
        let title="";
        let pic="";
        let typeName="";
        let dec="";
        let remark="";
        let vod={vod_id:id,vod_name:title,vod_pic:pic,type_name:typeName,vod_remarks:remark,vod_content:dec};
        
        initPan();
        let panVod = panDetailContent(vod ,urls);
        TABS = panVod.tabs
        LISTS = panVod.lists
        detailError = panVod.error
        vod["vod_play_from"]=panVod.tabs.join("$$$");

        for (var i in LISTS) {
            if (LISTS.hasOwnProperty(i)) {
              // print(i);
              try {
                LISTS[i] = LISTS[i].map(function (it) {
                  return it.split('$').slice(0, 2).join('$');
                });
              } catch (e) {
                print('格式化LISTS发生错误:' + e.message);
              }
            }
        }
        vod_play_url = LISTS.map(function (it) {
            return it.join('#');
        }).join("$$$");
        vod["vod_play_url"]=vod_play_url;
        VOD=vod;
    `,
    搜索:`js:
        let d = [];
        pdfh = jsp.pdfh;
        pdfa = jsp.pdfa;
        pd = jsp.pd;
        var aurl = input + 's/' + rule.params + '?q=' + KEY;
        let html = request(aurl);
        let list = pdfa(html, 'div.tgme_widget_message_bubble');
        list.forEach(it => {
            let text = pdfh(it, '.tgme_widget_message_text&&Text');
            let title = '';
            let desc = '';
            let content = '';
            
            // 精准提取名称和描述
            if(text.includes('名称：')){
                try {
                    // 提取名称 - 在<br>之前的内容
                    title = text.split('描述：')[0].replace('名称：','').trim();
                    // 提取描述 - 在第一个<br>之后,歌曲列表之前的内容
                    content = text.split('描述：')[1].split('链接：')[0].trim();
                    desc = text.split('标签：')[1].split('👥')[0].trim();
                    
                    // 提取图片 - 直接使用style的值作为图片url
                    let img = '';
                    try{
                        img = pdfh(it, '.tgme_widget_message_photo_wrap&&style').trim();
                        // 如果获取到的是带引号的字符串，去掉引号
                        if(img.startsWith("'") && img.endsWith("'")){
                            img = img.slice(1,-1);
                        }
                    }catch(e){
                        console.log('提取图片错误:', e.message);
                    }
                    
                    // 修改链接提取部分
                    let url = '';
                    try {
                        // 获取所有链接
                        let links = pdfa(it, '.js-message_text a');
                        let urls = [];
                        // 遍历所有链接元素
                        links.forEach(link => {
                            let href = pd(link, 'a&&href', HOST);
                            if(href && !href.includes('t.me')) urls.push(href);
                        });
                        // 用逗号连接所有链接
                        url = urls.join(',');
                    } catch(e) {
                        log('提取链接错误:' + e.message);
                    }
                    
                    // 如果有链接才添加到结果中
                    if(url){
                        d.push({
                            title: title,
                            desc: desc,
                            content: content,
                            pic_url: img,
                            url: url
                        });
                    }
                } catch(e) {
                    log('处理消息出错:'+e.message);
                }
            }
        });
        setResult(d);
    `,
}