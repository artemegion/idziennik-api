document.addEventListener('DOMContentLoaded', function()
{
    fetchFragment(window.location.hash || 'index');

    document.querySelectorAll('a').forEach(function(a)
    {
        if(a.hash.startsWith('#'))
        {
            a.addEventListener('click', function(ev)
            {
                fetchFragment(a.hash);
            });
        }
    });
});

window.addEventListener('hashchange', function(ev)
{
    fetchFragment(window.location.hash || 'index');
});

function fetchFragment(id)
{
    if(typeof id !== 'string')
    {
        throw new Error('Could not fetch fragment (fragment id is not a string)');
    }
    else
    {
        if(id.startsWith('#'))
        {
            id = id.slice(1);
        }

        let req = new XMLHttpRequest();
        req.open('GET', './res/fragments/' + id + '.html', true);
    
        req.addEventListener('readystatechange', function(ev)
        {
            if(req.readyState === req.DONE)
            {
                document.getElementById('site-content').innerHTML = req.responseText;
    
                document.querySelectorAll('code[lang="javascript"]').forEach(function(elem)
                {
                    elem.innerText = js_beautify(elem.innerText, {
                        indent_size: 4,
                        indent_char: ' ',
                        indent_scripts: 'normal',
                        brace_style: 'expand'
                    });
                });
                
                document.querySelectorAll('code').forEach(function(code)
                {
                    hljs.highlightBlock(code);
                });

                document.querySelectorAll('#site-content a').forEach(function(a)
                {
                    if(a.hash.startsWith('#'))
                    {
                        a.addEventListener('click', function(ev)
                        {
                            fetchFragment(a.hash);
                        });
                    }
                });
            }
        });
    
        req.send();
    }
}