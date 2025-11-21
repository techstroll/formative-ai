/**
 * Email Service - SendGrid integration for validation workflows
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface ValidationEmail {
  to: string;
  artifactId: string;
  artifactType: 'research' | 'wireframe' | 'prototype' | 'prd';
  approveUrl: string;
  rejectUrl: string;
  previewUrl: string;
}

class EmailService {
  private sendGridApiKey = process.env.SENDGRID_API_KEY || '';
  private fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@formative-ai.com';
  private appUrl = process.env.APP_URL || 'http://localhost:3000';

  /**
   * Send validation email
   */
  async sendValidationEmail(validation: ValidationEmail): Promise<boolean> {
    // For now, log to console (demo mode)
    // In production, use SendGrid SDK
    if (!this.sendGridApiKey) {
      console.log('[DEMO] Validation email would be sent:', {
        to: validation.to,
        artifactType: validation.artifactType,
        approveUrl: validation.approveUrl,
        rejectUrl: validation.rejectUrl,
      });
      return true;
    }

    try {
      const template = this.generateValidationTemplate(validation);
      console.log('Sending validation email via SendGrid:', { to: validation.to, subject: template.subject });
      // TODO: Implement actual SendGrid API call
      return true;
    } catch (error) {
      console.error('Error sending validation email:', error);
      return false;
    }
  }

  /**
   * Send research completion notification
   */
  async sendResearchNotification(
    to: string,
    topic: string,
    researchUrl: string,
    exportUrl: string,
  ): Promise<boolean> {
    const template = this.generateResearchTemplate(topic, researchUrl, exportUrl);

    console.log('[DEMO] Research notification email:', {
      to,
      subject: template.subject,
      previewUrl: researchUrl,
    });

    return true;
  }

  /**
   * Generate validation email template
   */
  private generateValidationTemplate(validation: ValidationEmail): EmailTemplate {
    const artifact = validation.artifactType.charAt(0).toUpperCase() + validation.artifactType.slice(1);

    const html = `
      <h2>${artifact} Awaiting Approval</h2>
      <p>A new ${validation.artifactType} artifact is ready for your review.</p>

      <p>
        <a href="${validation.previewUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Preview ${artifact}
        </a>
      </p>

      <p>
        <a href="${validation.approveUrl}" style="padding: 10px 20px; background-color: #008CBA; color: white; text-decoration: none; border-radius: 5px; margin-right: 10px;">
          ✓ Approve
        </a>
        <a href="${validation.rejectUrl}" style="padding: 10px 20px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px;">
          ✗ Request Changes
        </a>
      </p>

      <hr>
      <p><small>Artifact ID: ${validation.artifactId}</small></p>
    `;

    return {
      subject: `${artifact} #${validation.artifactId} Awaiting Approval`,
      html,
      text: `${artifact} #${validation.artifactId} awaiting approval. Review at: ${validation.previewUrl}`,
    };
  }

  /**
   * Generate research completion template
   */
  private generateResearchTemplate(topic: string, researchUrl: string, exportUrl: string): EmailTemplate {
    const html = `
      <h2>Research Complete: ${topic}</h2>
      <p>Your market research report is ready!</p>

      <h3>Available Sections:</h3>
      <ul>
        <li>Executive Summary</li>
        <li>Market Analysis</li>
        <li>SWOT Analysis</li>
        <li>Competitor Matrix</li>
        <li>Key Insights</li>
        <li>Recommendations</li>
      </ul>

      <p>
        <a href="${researchUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-right: 10px;">
          View Report
        </a>
        <a href="${exportUrl}" style="padding: 10px 20px; background-color: #008CBA; color: white; text-decoration: none; border-radius: 5px;">
          Download (PDF)
        </a>
      </p>
    `;

    return {
      subject: `Market Research Complete: ${topic}`,
      html,
      text: `Research complete for ${topic}. View at: ${researchUrl}`,
    };
  }

  /**
   * Generate approval/rejection email template
   */
  private generateApprovalTemplate(
    artifactType: string,
    approved: boolean,
    feedback?: string,
  ): EmailTemplate {
    const status = approved ? 'Approved' : 'Requested Changes';
    const color = approved ? '#4CAF50' : '#FF9800';

    const html = `
      <h2 style="color: ${color};">${artifactType} ${status}</h2>
      ${feedback ? `<p><strong>Feedback:</strong></p><p>${feedback}</p>` : ''}
      <p>Next steps will be communicated shortly.</p>
    `;

    return {
      subject: `${artifactType} ${status}`,
      html,
      text: `${artifactType} ${status}${feedback ? `. Feedback: ${feedback}` : ''}`,
    };
  }
}

export const emailService = new EmailService();
