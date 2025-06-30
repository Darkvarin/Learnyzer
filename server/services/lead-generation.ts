import { db } from "../db";
import { users } from "@shared/schema";
import { desc, and, gte, lte, isNotNull, or, eq, like, sql } from "drizzle-orm";
import * as XLSX from "xlsx";

export interface LeadGenerationFilters {
  startDate?: Date;
  endDate?: Date;
  hasEmail?: boolean;
  hasMobile?: boolean;
  grade?: string;
  track?: string;
}

export interface LeadData {
  id: number;
  username: string;
  name: string;
  email: string | null;
  mobile: string | null;
  grade: string | null;
  track: string | null;
  createdAt: Date;
  lastActiveAt?: Date;
  totalXp: number;
  level: number;
  referralCode: string;
}

export class LeadGenerationService {
  /**
   * Get all leads with optional filtering
   */
  async getLeads(filters: LeadGenerationFilters = {}): Promise<LeadData[]> {
    let query = db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      mobile: users.mobile,
      grade: users.grade,
      track: users.track,
      createdAt: users.createdAt,
      totalXp: users.currentXp,
      level: users.level,
      referralCode: users.referralCode
    }).from(users);

    // Apply filters
    const conditions = [];

    if (filters.startDate) {
      conditions.push(gte(users.createdAt, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(users.createdAt, filters.endDate));
    }

    if (filters.hasEmail) {
      conditions.push(isNotNull(users.email));
    }

    if (filters.hasMobile) {
      conditions.push(isNotNull(users.mobile));
    }

    if (filters.grade) {
      conditions.push(eq(users.grade, filters.grade));
    }

    if (filters.track) {
      conditions.push(eq(users.track, filters.track));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const leads = await query.orderBy(desc(users.createdAt));
    return leads;
  }

  /**
   * Get lead statistics
   */
  async getLeadStats() {
    const totalLeads = await db.select({ count: sql<number>`count(*)` }).from(users);
    
    const emailLeads = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(isNotNull(users.email));
    
    const mobileLeads = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(isNotNull(users.mobile));
    
    const bothContactLeads = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(isNotNull(users.email), isNotNull(users.mobile)));

    // Recent leads (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentLeads = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));

    // Leads by grade
    const leadsByGrade = await db.select({
      grade: users.grade,
      count: sql<number>`count(*)`
    })
    .from(users)
    .where(isNotNull(users.grade))
    .groupBy(users.grade);

    return {
      total: totalLeads[0]?.count || 0,
      withEmail: emailLeads[0]?.count || 0,
      withMobile: mobileLeads[0]?.count || 0,
      withBothContacts: bothContactLeads[0]?.count || 0,
      recentLeads: recentLeads[0]?.count || 0,
      leadsByGrade: leadsByGrade || []
    };
  }

  /**
   * Export leads to Excel format
   */
  async exportToExcel(filters: LeadGenerationFilters = {}): Promise<Buffer> {
    const leads = await this.getLeads(filters);
    
    // Transform data for Excel
    const excelData = leads.map(lead => ({
      'ID': lead.id,
      'Username': lead.username,
      'Full Name': lead.name,
      'Email': lead.email || 'Not provided',
      'Mobile': lead.mobile || 'Not provided',
      'Grade': lead.grade || 'Not specified',
      'Track': lead.track || 'Not specified',
      'Registration Date': lead.createdAt.toLocaleDateString(),
      'Registration Time': lead.createdAt.toLocaleTimeString(),
      'Current Level': lead.level,
      'Total XP': lead.totalXp,
      'Referral Code': lead.referralCode
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 15 },  // Username
      { wch: 20 },  // Full Name
      { wch: 25 },  // Email
      { wch: 15 },  // Mobile
      { wch: 10 },  // Grade
      { wch: 15 },  // Track
      { wch: 15 },  // Registration Date
      { wch: 15 },  // Registration Time
      { wch: 12 },  // Current Level
      { wch: 10 },  // Total XP
      { wch: 15 }   // Referral Code
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    // Generate statistics sheet
    const stats = await this.getLeadStats();
    const statsData = [
      { 'Metric': 'Total Leads', 'Value': stats.total },
      { 'Metric': 'Leads with Email', 'Value': stats.withEmail },
      { 'Metric': 'Leads with Mobile', 'Value': stats.withMobile },
      { 'Metric': 'Leads with Both Contacts', 'Value': stats.withBothContacts },
      { 'Metric': 'Recent Leads (30 days)', 'Value': stats.recentLeads },
      { 'Metric': '', 'Value': '' }, // Spacer
      { 'Metric': 'LEADS BY GRADE', 'Value': '' },
      ...stats.leadsByGrade.map((item: any) => ({
        'Metric': `Grade ${item.grade}`,
        'Value': item.count
      }))
    ];

    const statsWorksheet = XLSX.utils.json_to_sheet(statsData);
    statsWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Statistics');

    // Convert to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  /**
   * Get email list for marketing campaigns
   */
  async getEmailList(filters: LeadGenerationFilters = {}): Promise<string[]> {
    const leads = await this.getLeads({ ...filters, hasEmail: true });
    return leads
      .filter(lead => lead.email)
      .map(lead => lead.email as string);
  }

  /**
   * Get mobile list for SMS campaigns
   */
  async getMobileList(filters: LeadGenerationFilters = {}): Promise<string[]> {
    const leads = await this.getLeads({ ...filters, hasMobile: true });
    return leads
      .filter(lead => lead.mobile)
      .map(lead => lead.mobile as string);
  }

  /**
   * Search leads by keyword
   */
  async searchLeads(keyword: string): Promise<LeadData[]> {
    const leads = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      mobile: users.mobile,
      grade: users.grade,
      track: users.track,
      createdAt: users.createdAt,
      totalXp: users.currentXp,
      level: users.level,
      referralCode: users.referralCode
    })
    .from(users)
    .where(
      or(
        like(users.name, `%${keyword}%`),
        like(users.username, `%${keyword}%`),
        like(users.email, `%${keyword}%`),
        like(users.mobile, `%${keyword}%`)
      )
    )
    .orderBy(desc(users.createdAt));

    return leads;
  }
}

export const leadGenerationService = new LeadGenerationService();