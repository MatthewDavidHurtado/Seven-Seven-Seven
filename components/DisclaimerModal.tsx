import React from 'react';
import Button from './Button';
import { DownloadIcon } from '../constants';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="disclaimer-modal-title"
    >
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl h-[90vh] border border-slate-700 flex flex-col">
        <header className="flex-shrink-0 p-4 bg-slate-900/50 border-b border-slate-700">
          <h2 id="disclaimer-modal-title" className="text-xl font-bold text-[#c9a445] font-brand tracking-wider">KINGLEY FOUNDATION — LEGAL DISCLAIMER & MEMBERSHIP TERMS</h2>
          <p className="text-sm text-slate-400">(508(c)(1)(a) religious ministry; Private Members Only)</p>
        </header>
        
        <div 
          id="disclaimer-content"
          className="flex-grow p-6 overflow-y-auto text-slate-300 text-sm prose prose-sm prose-invert max-w-none prose-headings:text-[#c9a445] prose-headings:font-semibold prose-strong:text-slate-200"
        >
          <p><strong>Effective Date:</strong> 09/05/2025</p>
          <p><strong>Contact:</strong> tmoa@allowministries.com</p>
          <p><strong>Mailing Address:</strong> KINGLEY FOUNDATION, Attn: Malcolm Kingley, 7402 N 56th St, Ste 355-283, Tampa, FL 33617, USA</p>
          
          <h4 className="font-bold mt-4">1) Who We Are & What This Is</h4>
          <p>KINGLEY FOUNDATION (“Ministry,” “we,” “our”) is a faith-based religious organization operating under 508(c)(1)(a) principles. Our programs, writings, courses, coaching, communities, software, videos, and events (collectively, the “Services”) are offered to private members for spiritual study, religious education, moral support, and creative/spiritual exploration.</p>
          <p>We use symbolic, imaginative, and allegorical language—including mythic/fictional frameworks and “bio-code” metaphors—to explore spiritual ideas. All participants acknowledge and agree that our content is spiritual/educational and exploratory, not professional advice of any kind.</p>
          <p><strong>Not Medical/Legal/Financial Advice:</strong> Nothing we provide is medical, psychological, legal, accounting, investment, or other licensed professional advice; no doctor–patient, therapist–client, attorney–client, or fiduciary relationship is created.</p>

          <h4 className="font-bold mt-4">2) Private Membership Association (PMA) Notice</h4>
          <p>Access to our Services requires you to be a Private Member of KINGLEY FOUNDATION and to accept these terms. By joining, registering, purchasing, downloading, viewing, or otherwise using any Service, you consent to participate in a private, ecclesiastical, faith-based forum to the maximum extent permitted by applicable law.</p>
          <p>This PMA structure is intended to preserve religious liberty, association, and privacy interests—not to avoid or violate law. All applicable laws still apply. If any activity requires a license or is restricted by law, we will comply or instruct you not to proceed.</p>

          <h4 className="font-bold mt-4">3) Scope & Reliance</h4>
          <p>The Services may reference health, wealth, relationships, ethics, purpose, or personal transformation. These are religious/spiritual opinions and educational tools only. Do not rely on our materials to make medical, mental-health, legal, financial, safety, or other consequential decisions.</p>
          <ul>
            <li><strong>Health:</strong> Consult a licensed physician or qualified clinician for diagnosis, treatment, or emergency care.</li>
            <li><strong>Mental health & crisis:</strong> If you are in danger or in crisis, call local emergency services immediately (e.g., 911 in the U.S.) or contact appropriate crisis resources.</li>
            <li><strong>Legal/financial:</strong> Seek independent licensed counsel before acting on contracts, taxes, investments, debt, or business decisions.</li>
          </ul>

          <h4 className="font-bold mt-4">4) No Guarantees; Individual Results Vary</h4>
          <p>We share testimonies, case studies, or examples for illustration. They are not typical and do not guarantee you will achieve similar outcomes. Your results depend on many factors outside our control (history, effort, timing, market, health, grace, providence, etc.).</p>

          <h4 className="font-bold mt-4">5) Earnings & Performance Disclosure</h4>
          <p>Any references to fees, income, “wealth,” business growth, or performance are aspirational religious/educational statements and not promises of results. We do not guarantee revenues, profits, client acquisition, or business outcomes.</p>

          <h4 className="font-bold mt-4">6) Software, AI & Data</h4>
          <p>Where software or AI assistants are provided, they are tools for spiritual/educational reflection. Outputs may be incomplete, outdated, or inaccurate. You are solely responsible for verifying information and for all actions you take (or do not take) based on these tools.</p>
          <p>We take reasonable administrative, technical, and physical safeguards to protect data; however, no system is perfectly secure. You agree we are not liable for unauthorized access, interception, loss, or alteration except where prohibited by law. See our Privacy Policy for details.</p>

          <h4 className="font-bold mt-4">7) Assumption of Risk</h4>
          <p>By participating, you voluntarily assume all risks associated with using our Services—including physical, emotional, financial, reputational, or other consequences—and you agree to use prudent judgment and obtain professional help where appropriate.</p>

          <h4 className="font-bold mt-4">8) Release, Hold Harmless & Indemnification</h4>
          <p>To the fullest extent permitted by law, you release and forever discharge KINGLEY FOUNDATION, its overseers, officers, directors, staff, volunteers, licensees, contractors, agents, and Malcolm Kingley (collectively, the “Released Parties”) from any and all claims, demands, damages, losses, liabilities, costs, and expenses (including attorneys’ fees) arising out of or related to your membership or use of the Services.</p>
          <p>You further agree to defend, indemnify, and hold harmless the Released Parties from any third-party claims connected to your conduct, reliance, postings, business activities, or violation of these terms.</p>

          <h4 className="font-bold mt-4">9) Intellectual Property & License</h4>
          <p>All content (texts, videos, images, audio, code, curricula, frameworks, and marks) is owned or licensed by the Ministry and protected by law. Membership grants you a personal, non-transferable, revocable license to access content for your private religious/educational use only.</p>
          <p>You may not reproduce, distribute, exploit, or create derivative works without express written permission. If we provide templates or white-label assets under a separate license, that license controls.</p>

          <h4 className="font-bold mt-4">10) User-Generated Content; Community Conduct</h4>
          <p>If you post or submit materials, you grant the Ministry a non-exclusive, worldwide, royalty-free license to display, store, and use the content within the membership and for ministry purposes. You represent that you own or control the rights to anything you post.</p>
          <p>No harassing, illegal, or defamatory content. We may moderate or remove content at our discretion.</p>

          <h4 className="font-bold mt-4">11) Minors</h4>
          <p>Our Services are intended for adults 18+. Parents/guardians are solely responsible for any minor’s access or use.</p>
          
          <h4 className="font-bold mt-4">12) Third-Party Links & Services</h4>
          <p>We may reference or link to third-party services. We do not control or endorse them and are not responsible for their content, policies, or actions. Your use is at your own risk.</p>
          
          <h4 className="font-bold mt-4">13) Government & Agency Notice</h4>
          <p>We respect lawful authority and cooperate as required by law. Nothing herein waives defenses, privileges, or protections under the U.S. Constitution, federal/state law, or applicable religious-liberty statutes. Our PMA and 508(c)(1)(a) status do not exempt us from generally applicable laws or valid orders; they do inform our ecclesiastical purpose, faith practices, and private association.</p>
          
          <h4 className="font-bold mt-4">14) No Waiver of Rights</h4>
          <p>Failure to enforce any provision is not a waiver. If any part of these terms is held invalid or unenforceable, the remainder remains in effect (severability).</p>
          
          <h4 className="font-bold mt-4">15) Disclaimers of Warranties; Limitation of Liability</h4>
          <p><strong>AS-IS / AS-AVAILABLE.</strong> The Services are provided without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, title, or non-infringement.</p>
          <p>To the maximum extent allowed by law, the Released Parties are not liable for any indirect, incidental, consequential, special, exemplary, or punitive damages; for lost profits, data, goodwill, or business interruption; or for any amount exceeding the fees you paid to us in the three (3) months preceding the event giving rise to the claim.</p>

          <h4 className="font-bold mt-4">16) Dispute Resolution; Arbitration; Class-Action Waiver</h4>
          <p><strong>Good-Faith Resolution.</strong> You agree to first notify us in writing of any dispute and attempt informal resolution within 30 days.</p>
          <p><strong>Binding Arbitration.</strong> If unresolved, disputes shall be exclusively resolved by final, binding arbitration administered by JAMS or AAA under their consumer/commercial rules, seated in Hillsborough County, Florida, before a single arbitrator.</p>
          <p><strong>No Class Actions.</strong> Proceedings are individual only; no class, collective, or representative actions or consolidated claims.</p>
          <p><strong>Injunctive Relief.</strong> A court may enter judgment on the award and grant temporary injunctive relief to protect IP or confidentiality.</p>
          <p><strong>Governing Law.</strong> Florida law (without conflict rules) governs, except that federal arbitration law (FAA) governs enforceability of this Section.</p>

          <h4 className="font-bold mt-4">17) Changes to Terms</h4>
          <p>We may update these terms from time to time. The “Effective Date” will change when updates are posted. Continued use after updates constitutes acceptance.</p>

          <h4 className="font-bold mt-4">18) Contact</h4>
          <p>Questions, notices, or legal correspondence:<br />
          KINGLEY FOUNDATION — Attn: Malcolm Kingley<br />
          7402 N 56th St, Ste 355-283, Tampa, FL 33617, USA<br />
          Email: tmoa@allowministries.com</p>
        </div>

        <footer className="flex-shrink-0 p-4 bg-slate-900/50 border-t border-slate-700 flex justify-between items-center">
          <a
            href="https://drive.google.com/file/d/19xX2KUngAztkD4enLSuuibNDgNr21N9k/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a192f] transition-colors duration-200 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500"
          >
            <DownloadIcon />
            Download Signature Form
          </a>
          <Button onClick={onAccept} className="w-full md:w-auto">
            I Have Read and Agree to These Terms
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default DisclaimerModal;