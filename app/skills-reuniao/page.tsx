'use client';
import AppSidebar from '../AppSidebar';
import {SkillsContent} from '../skills/page';
import SkillsProPage from '../skills-pro/page';

export default function MeetingSkillsPage(){
  return <main className="app-shell skills-page meeting-skills-page">
    <AppSidebar/>
    <div className="meeting-skills-scroll">
      <SkillsContent/>
      <section className="meeting-skills-pro-section">
        <SkillsProPage/>
      </section>
    </div>
    <style jsx global>{`
      .meeting-skills-page{min-height:100vh;background:#0d0f10;overflow:hidden}
      .meeting-skills-scroll{margin-left:224px;width:calc(100vw - 224px);height:100vh;overflow-y:auto;overflow-x:hidden;scroll-behavior:smooth}
      .meeting-skills-scroll>.skills-site-content{margin-left:0!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;padding-left:24px!important;padding-right:32px!important;overflow:hidden!important}
      .meeting-skills-scroll>.skills-site-content .skills-stage{width:calc(100% - 96px)!important;max-width:1320px!important;min-width:0!important;box-sizing:border-box!important;margin-left:auto!important;margin-right:auto!important;transform:translateX(-70px)!important}
      .meeting-skills-scroll>.skills-site-content .skills-top-grid,.meeting-skills-scroll>.skills-site-content .skills-metrics,.meeting-skills-scroll>.skills-site-content .skills-bottom-grid{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;margin-left:auto!important;margin-right:auto!important}
      .meeting-skills-scroll>.skills-site-content .skills-top-grid>* ,.meeting-skills-scroll>.skills-site-content .skills-metrics>* ,.meeting-skills-scroll>.skills-site-content .skills-bottom-grid>*{min-width:0!important}
      .meeting-skills-pro-section{position:relative;width:100%;min-height:100vh;border-top:1px solid rgba(255,255,255,.09)}
      .meeting-skills-pro-section .skills-pro-page{min-height:100vh!important}
      .meeting-skills-pro-section .skills-pro-page>.sidebar,
      .meeting-skills-pro-section .skills-pro-page>.app-topbar{display:none!important}
      .meeting-skills-pro-section .skills-pro-content{margin-left:0!important;width:100%!important;max-width:none!important}
      @media(max-width:820px){.meeting-skills-scroll{margin-left:184px;width:calc(100vw - 184px)}}
    `}</style>
  </main>
}
