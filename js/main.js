/* Calisthenics Flow landing — interactions
   Works without GSAP/Lenis (content stays visible); enhances when they load. */
(function(){
  'use strict';
  var d=document, w=window, html=d.documentElement;
  var reduced=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=w.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var $=function(s,c){return (c||d).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};

  /* ---------- UTM: tag outbound Patreon links, pass through incoming UTMs (e.g. from the Instagram bio) ---------- */
  (function utm(){
    var inc=new URLSearchParams(w.location.search);
    var base={utm_source:inc.get('utm_source')||'landing',utm_medium:inc.get('utm_medium')||'website',utm_campaign:inc.get('utm_campaign')||'cf_landing'};
    // Pass through incoming placement + ad click IDs when present
    ['utm_content','gclid','fbclid','utm_term','utm_id'].forEach(function(k){ var v=inc.get(k); if(v) base[k]=v; });
    $$('a[data-utm]').forEach(function(a){
      try{var u=new URL(a.getAttribute('href'));
        Object.keys(base).forEach(function(k){u.searchParams.set(k,base[k])});
        // Only overwrite utm_content if visitor didn't arrive with one
        if(!inc.get('utm_content')) u.searchParams.set('utm_content',a.getAttribute('data-utm'));
        a.setAttribute('href',u.toString());
      }catch(e){}
    });
  })();
  $$('[data-year]').forEach(function(el){el.textContent=new Date().getFullYear()});
  $$('[data-month-year]').forEach(function(el){
    try{ el.textContent = new Date().toLocaleString('en-US',{month:'long',year:'numeric'}); }
    catch(e){ el.textContent = new Date().getFullYear(); }
  });

  /* ---------- Mobile menu ---------- */
  var burger=$('.burger');
  function closeMenu(){d.body.classList.remove('menu-open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Open menu');if(w.__lenis)w.__lenis.start()}
  burger.addEventListener('click',function(){
    var open=d.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded',open);burger.setAttribute('aria-label',open?'Close menu':'Open menu');
    if(w.__lenis){open?w.__lenis.stop():w.__lenis.start()}
  });
  $$('.mmenu a').forEach(function(a){a.addEventListener('click',closeMenu)});

  /* ---------- Nav state + sticky CTA ---------- */
  var nav=$('#nav'), sticky=$('#sticky'), lastY=0, hero=$('.hero');
  function onScroll(){
    var y=w.scrollY||w.pageYOffset, hh=hero?hero.offsetHeight:600;
    nav.classList.toggle('is-scrolled',y>30);
    nav.classList.toggle('is-hidden',y>hh&&y>lastY+2&&!d.body.classList.contains('menu-open'));
    if(y<lastY-2)nav.classList.remove('is-hidden');
    var nearEnd=(w.innerHeight+y)>=(d.body.scrollHeight-260);
    var on=y>hh*0.75&&!nearEnd;
    sticky.classList.toggle('is-on',on);sticky.setAttribute('aria-hidden',!on);
    var sa=$('a',sticky); if(sa) sa.tabIndex=on?0:-1;
    lastY=y;
  }
  w.addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* ---------- Lazy videos ---------- */
  function loadVideo(v){$$('source[data-src]',v).forEach(function(s){s.src=s.dataset.src;s.removeAttribute('data-src')});v.load()}
  var lazyVids=$$('video[data-lazy-video]');
  if('IntersectionObserver' in w){
    var vio=new IntersectionObserver(function(es){es.forEach(function(e){
      var v=e.target;
      if(e.isIntersecting){ if(!v.dataset.loaded){loadVideo(v);v.dataset.loaded=1} if(!reduced){var p=v.play();if(p&&p.catch)p.catch(function(){})} }
      else if(v.dataset.loaded){v.pause()}
    })},{rootMargin:'200px 0px'});
    lazyVids.forEach(function(v){vio.observe(v)});
  }

  /* ---------- Video modal ---------- */
  var modal=$('#vmodal'), mv=$('video',modal), lastFocus=null;
  function openV(){lastFocus=d.activeElement;if(!mv.dataset.loaded){loadVideo(mv);mv.dataset.loaded=1}modal.classList.add('is-open');if(w.__lenis)w.__lenis.stop();$('.modal__x',modal).focus();var p=mv.play();if(p&&p.catch)p.catch(function(){})}
  function closeV(){modal.classList.remove('is-open');mv.pause();if(w.__lenis)w.__lenis.start();if(lastFocus)lastFocus.focus()}
  $$('[data-open-video]').forEach(function(b){b.addEventListener('click',openV)});
  $$('[data-close-video]').forEach(function(b){b.addEventListener('click',closeV)});
  modal.addEventListener('click',function(e){if(e.target===modal)closeV()});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'){if(modal.classList.contains('is-open'))closeV();if(d.body.classList.contains('menu-open'))closeMenu()}});

  /* ---------- Split manifesto into words ---------- */
  $$('[data-words]').forEach(function(el){
    var out=[];
    (function walk(node,cls){
      node.childNodes.forEach(function(n){
        if(n.nodeType===3){n.textContent.split(/(\s+)/).forEach(function(t){if(!t)return; if(/^\s+$/.test(t))out.push(t); else out.push('<span class="w'+(cls?' '+cls:'')+'">'+t+'</span>')})}
        else if(n.nodeType===1){walk(n,n.className)}
      });
    })(el,'');
    el.innerHTML=out.join('');
  });

  /* ---------- Fallback (no GSAP) ---------- */
  function noAnim(){
    html.classList.add('no-anim'); html.classList.remove('anim'); html.classList.add('is-loaded');
    var l=$('.loader'); if(l) l.remove();
    $$('[data-count]').forEach(function(el){el.textContent=el.dataset.count});
  }

  function start(){
    if(reduced||!w.gsap||!w.ScrollTrigger){noAnim();return}
    var gsap=w.gsap, ST=w.ScrollTrigger; gsap.registerPlugin(ST);
    html.classList.add('anim');
    // safety: if loader already gone via CSS, keep is-loaded in sync
    setTimeout(function(){html.classList.add('is-loaded')},3200);

    /* Lenis smooth scroll */
    if(w.Lenis){
      var lenis=new w.Lenis({duration:1.15,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},smoothWheel:true});
      w.__lenis=lenis; lenis.on('scroll',ST.update);
      gsap.ticker.add(function(t){lenis.raf(t*1000)}); gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href');if(id.length<2&&id!=='#')return;var t=id==='#'||id==='#top'?0:$(id);if(t===null)return;e.preventDefault();lenis.scrollTo(t,{offset:id==='#top'?0:-70,duration:1.4})})});
    }

    /* Preloader + hero intro */
    var tl=gsap.timeline({defaults:{ease:'expo.out'}});
    var loader=$('.loader');
    gsap.set('[data-split] .line-mask>span',{yPercent:110});
    gsap.set('[data-hero]',{opacity:0,y:24});
    gsap.set('.hero__img',{scale:1.18,opacity:0});
    if(loader){
      tl.to('.loader__mark',{opacity:1,scale:1,duration:.6})
        .to('.loader__bar',{scaleX:1,duration:.7,ease:'power2.inOut'},'<.05')
        .fromTo(loader,{clipPath:'inset(0% 0% 0% 0%)'},{clipPath:'inset(0% 0% 100% 0%)',duration:.9,ease:'expo.inOut',onComplete:function(){loader.remove();html.classList.add('is-loaded')}},'+=.05');
    }
    tl.to('.hero__img',{scale:1,opacity:1,duration:2.0,ease:'power3.out'},loader?'-=.55':0)
      .to('[data-split] .line-mask>span',{yPercent:0,duration:1.3,stagger:.12},'<.15')
      .to('[data-hero]',{opacity:1,y:0,duration:1.1,stagger:.1},'<.35')
      .add(function(){var he=$('.hero__eyebrow');if(he)he.classList.add('is-in')},'<.1');

    /* Hero parallax + glow follows pointer */
    gsap.to('.hero__img',{yPercent:12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero .wrap',{yPercent:-12,opacity:.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    if(fine){
      var glow=$('.hero__glow'), gx=gsap.quickTo(glow,'left',{duration:1.2,ease:'power3'}), gy=gsap.quickTo(glow,'top',{duration:1.2,ease:'power3'});
      hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();gx((e.clientX-r.left)/r.width*100+'%');gy((e.clientY-r.top)/r.height*100+'%')});
    }

    /* Marquee: infinite, speeds up with scroll velocity */
    $$('[data-marquee]').forEach(function(track){
      track.innerHTML+=track.innerHTML; // duplicate for seamless loop
      var x=0, speed=1, half=0;
      function measure(){half=track.scrollWidth/2}
      measure(); w.addEventListener('resize',measure);
      var dir=1;
      ST.create({trigger:track,start:'top bottom',end:'bottom top',onUpdate:function(s){var v=Math.abs(s.getVelocity())/250;speed=1+Math.min(v,8);dir=s.direction}});
      gsap.ticker.add(function(){x-= (0.6*speed); speed+= (1-speed)*0.05; if(-x>=half)x+=half; if(x>0)x-=half; track.style.transform='translate3d('+x+'px,0,0)'});
    });

    /* Scroll-split headings */
    $$('[data-split-scroll]').forEach(function(h){
      gsap.from($$('.line-mask>span',h),{yPercent:110,duration:1.2,ease:'expo.out',stagger:.1,scrollTrigger:{trigger:h,start:'top 85%'}});
    });

    /* Generic reveals (CSS transform transitions are paused while GSAP drives the element, so they don't fight) */
    ST.batch('[data-reveal]',{start:'top 88%',onEnter:function(b){
      b.forEach(function(e){e.style.transition='none'});
      gsap.to(b,{opacity:1,y:0,duration:1.1,ease:'expo.out',stagger:.08,overwrite:true,onComplete:function(){b.forEach(function(e){e.style.transition=''})}});
    }});

    /* Eyebrow rule draws in (CSS transition on ::before, toggled once) */
    ST.batch('.eyebrow:not(.hero__eyebrow)',{start:'top 90%',once:true,onEnter:function(b){b.forEach(function(e){e.classList.add('is-in')})}});

    /* Staggered fade-up for list items / cards inside [data-stagger] containers */
    $$('[data-stagger]').forEach(function(el){
      gsap.from(el.children,{y:28,opacity:0,duration:1,ease:'power3.out',stagger:.08,scrollTrigger:{trigger:el,start:'top 86%'}});
    });

    /* Curtain reveals for the About collage: figure wipes up, photo settles from 1.15 */
    $$('[data-clip]').forEach(function(f){
      var im=$('img',f), t=gsap.timeline({scrollTrigger:{trigger:f,start:'top 85%'}});
      t.fromTo(f,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.3,ease:'power3.inOut'});
      if(im) t.fromTo(im,{scale:1.15},{scale:1,duration:1.4,ease:'expo.out'},.2);
    });
    var badge=$('.about__badge');
    if(badge){gsap.set(badge,{xPercent:-50,yPercent:-50,x:0,y:0});
      gsap.from(badge,{scale:.4,rotate:-120,opacity:0,duration:1.3,ease:'expo.out',scrollTrigger:{trigger:'.about__photos',start:'top 70%'}});}

    /* Inset wipes for section photos: frame opens from an inset, image scales down from 1.15 */
    $$('[data-wipe]').forEach(function(wr){
      var im=$('img',wr), rad=getComputedStyle(wr).borderTopLeftRadius||'0px';
      var t=gsap.timeline({scrollTrigger:{trigger:wr,start:'top 82%'}});
      t.fromTo(wr,{clipPath:'inset(9% 7% 9% 7% round '+rad+')'},{clipPath:'inset(0% 0% 0% 0% round '+rad+')',duration:1.3,ease:'expo.out',onComplete:function(){gsap.set(wr,{clearProps:'clipPath'})}});
      if(im) t.fromTo(im,{scale:1.15},{scale:1,duration:1.4,ease:'power3.out'},0);
    });

    /* Gallery: each slide wipes up as it arrives (vertical on enter; horizontally via containerAnimation on desktop) */
    var gal=$('[data-gallery]'), gFigs=gal?$$('figure',gal):[];
    function revealFig(f,delay){
      if(f._shown)return; f._shown=1; var im=$('img',f);
      gsap.to(f,{clipPath:'inset(0% 0% 0% 0% round 18px)',duration:1.2,ease:'expo.out',delay:delay||0,onComplete:function(){gsap.set(f,{clearProps:'clipPath'})}});
      gsap.to(im,{scale:1,duration:1.4,ease:'power3.out',delay:delay||0,onComplete:function(){gsap.set(im,{clearProps:'transform'});im.style.transition=''}});
    }
    gFigs.forEach(function(f){var im=$('img',f);im.style.transition='none';gsap.set(f,{clipPath:'inset(100% 0% 0% 0% round 18px)'});gsap.set(im,{scale:1.18})});

    /* Parallax images */
    $$('[data-parallax]').forEach(function(el){
      var amt=parseFloat(el.dataset.parallax)||8;
      gsap.fromTo(el,{yPercent:-amt},{yPercent:amt,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
    });

    /* Manifesto word-by-word light-up */
    $$('[data-words]').forEach(function(el){
      gsap.to($$('.w',el),{opacity:1,stagger:.08,ease:'none',scrollTrigger:{trigger:el,start:'top 80%',end:'bottom 45%',scrub:true}});
    });

    /* Counters (real numbers only) */
    $$('[data-count]').forEach(function(el){
      var end=parseFloat(el.dataset.count), dec=parseInt(el.dataset.dec||'0',10), o={v:0};
      el.textContent=(0).toFixed(dec);
      gsap.to(o,{v:end,duration:2,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%'},onUpdate:function(){el.textContent=o.v.toFixed(dec)}});
    });

    /* Club week rows stagger */
    gsap.from('.week li',{x:-20,opacity:0,duration:.8,stagger:.07,ease:'expo.out',scrollTrigger:{trigger:'.week',start:'top 80%'}});

    /* Horizontal gallery: pinned scroll on desktop, native swipe on mobile */
    var mm=gsap.matchMedia();
    mm.add('(min-width: 900px)',function(){
      var track=$('[data-hscroll]'), wrapEl=$('.gallery__wrap');
      wrapEl.classList.add('is-pinned');
      var dist=function(){return Math.max(0,track.scrollWidth-w.innerWidth)};
      var t=gsap.to(track,{x:function(){return -dist()},ease:'none',scrollTrigger:{trigger:'.gallery',start:'top top',end:function(){return '+='+dist()},pin:true,scrub:1,invalidateOnRefresh:true}});
      var k=0;
      gFigs.forEach(function(f){
        if(f._shown)return;
        if(f.getBoundingClientRect().left<w.innerWidth){var dl=.1*(k++);ST.create({trigger:'.gallery',start:'top 72%',once:true,onEnter:function(){revealFig(f,dl)}})}
        else ST.create({trigger:f,containerAnimation:t,start:'left 94%',once:true,onEnter:function(){revealFig(f)}});
      });
      return function(){wrapEl.classList.remove('is-pinned');gsap.set(track,{x:0})};
    });
    mm.add('(max-width: 899px)',function(){
      ST.create({trigger:'.gallery__wrap',start:'top 85%',once:true,onEnter:function(){gFigs.forEach(function(f,i){revealFig(f,Math.min(i,3)*.1)})}});
    });

    /* Final glow breathing */
    gsap.to('.final__glow',{scale:1.15,opacity:.7,duration:4,yoyo:true,repeat:-1,ease:'sine.inOut'});

    /* Magnetic buttons + cursor (desktop / fine pointer only) */
    if(fine){
      html.classList.add('has-cursor');
      var cur=$('.cursor');
      if(cur){
        // Init at viewport centre so the yellow dot is visible before first move
        gsap.set(cur,{x:w.innerWidth/2,y:w.innerHeight/2,opacity:1});
        var cx=gsap.quickTo(cur,'x',{duration:.25,ease:'power3'}), cy=gsap.quickTo(cur,'y',{duration:.25,ease:'power3'});
        w.addEventListener('pointermove',function(e){cx(e.clientX);cy(e.clientY)},{passive:true});
        // Delegated hover expand (avoids per-element listeners)
        d.addEventListener('pointerover',function(e){
          if(e.target.closest && e.target.closest('a,button,.plan,.plan-group,.reelcard,summary,.magnetic')) cur.classList.add('is-hover');
        });
        d.addEventListener('pointerout',function(e){
          if(e.target.closest && e.target.closest('a,button,.plan,.plan-group,.reelcard,summary,.magnetic')) cur.classList.remove('is-hover');
        });
      }
      // Magnetic pull — still per .magnetic (few nodes); leave/ enter via delegation would lose xTo/yTo state
      $$('.magnetic').forEach(function(b){
        // GSAP owns the transform here — drop the CSS transform transition so the two never fight (no lag/jank)
        if(b.classList.contains('btn'))b.style.transition='box-shadow .5s cubic-bezier(.22,1,.36,1)';
        var xTo=gsap.quickTo(b,'x',{duration:.6,ease:'elastic.out(1,0.4)'}), yTo=gsap.quickTo(b,'y',{duration:.6,ease:'elastic.out(1,0.4)'});
        b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();xTo((e.clientX-r.left-r.width/2)*.28);yTo((e.clientY-r.top-r.height/2)*.38)});
        b.addEventListener('pointerleave',function(){xTo(0);yTo(0)});
      });
    }

    w.addEventListener('load',function(){ST.refresh()});
  }

  /* Wait for deferred CDN scripts; fall back if they fail */
  if(d.readyState==='complete'||d.readyState==='interactive'){start()} else d.addEventListener('DOMContentLoaded',start);
})();
