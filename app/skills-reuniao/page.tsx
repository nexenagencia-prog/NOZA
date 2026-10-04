'use client';
import AppSidebar from '../AppSidebar';
import {SkillsContent} from '../skills/page';

export default function MeetingSkillsPage(){
  return <main className="app-shell skills-page meeting-skills-page">
    <AppSidebar/>
    <div className="meeting-skills-scroll">
      <SkillsContent artwork="/skills-card.webp?v=noza-meeting-20261004"/>
    </div>
    <style jsx global>{`
      .meeting-skills-page{min-height:100vh;background:#0d0f10;overflow:hidden}
      .meeting-skills-scroll{margin-left:224px;width:calc(100vw - 224px);height:100vh;overflow-y:auto;overflow-x:hidden;scroll-behavior:smooth}
      .meeting-skills-page .meeting-skills-scroll>.skills-site-content{margin-left:0!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;padding:27px 36px 18px!important;overflow:hidden!important}
      .meeting-skills-page .meeting-skills-scroll>.skills-site-content .skills-stage{width:100%!important;max-width:1320px!important;min-width:0!important;box-sizing:border-box!important;margin:0 auto!important;transform:none!important}
      .meeting-skills-page .meeting-skills-scroll>.skills-site-content .skills-top-grid,.meeting-skills-page .meeting-skills-scroll>.skills-site-content .skills-metrics,.meeting-skills-page .meeting-skills-scroll>.skills-site-content .skills-bottom-grid{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;margin-left:auto!important;margin-right:auto!important}
      .meeting-skills-page .meeting-skills-scroll>.skills-site-content .skills-top-grid>* ,.meeting-skills-page .meeting-skills-scroll>.skills-site-content .skills-metrics>* ,.meeting-skills-page .meeting-skills-scroll>.skills-site-content .skills-bottom-grid>*{min-width:0!important}
      @media(max-width:820px){.meeting-skills-scroll{margin-left:184px;width:calc(100vw - 184px)}}
    `}</style>
  </main>
}
