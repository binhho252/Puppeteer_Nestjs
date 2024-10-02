import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PuppeteerService {
  private browser: puppeteer.Browser;

  // Khởi tạo trình duyệt
  async initBrowser() {
    try {
      this.browser = await puppeteer.launch({ headless: true });
    } catch (error) {
      console.error('Failed to launch the browser:', error.message);
      throw new Error('Failed to initialize browser.');
    }
  }

  // Đóng trình duyệt
  async closeBrowser() {
    try {
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      console.error('Failed to close the browser:', error.message);
    }
  }

  // Hàm crawl dữ liệu từ YouTube
  async crawlYouTubeData(videoUrl: string) {
    let page;
    try {
      page = await this.browser.newPage();
      
      // Chờ cho trang được tải đầy đủ với timeout
      await page.goto(videoUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Lấy tiêu đề video
      const titleElement = await page.$('h1.title');
      if (titleElement) {
        const title = await page.$eval('h1.title', (element) => element.textContent.trim());
        console.log('Video Title:', title);
      } else {
        console.log('Error: Title element not found.');
      }

      // Lấy số lượt xem
      const viewsElement = await page.$('.view-count');
      if (viewsElement) {
        const views = await page.$eval('.view-count', (element) => element.textContent.trim());
        console.log('Views:', views);
      } else {
        console.log('Error: Views element not found.');
      }

      // Lấy mô tả video
      const descriptionElement = await page.$('#description');
      if (descriptionElement) {
        const description = await page.$eval('#description', (element) => element.textContent.trim());
        console.log('Description:', description);
      } else {
        console.log('Error: Description element not found.');
      }

      // Lấy transcript (nếu có)
      const transcriptButton = await page.$('button[aria-label="Open transcript"]');
      if (transcriptButton) {
        await transcriptButton.click();
        await page.waitForSelector('.ytd-transcript-renderer');
        const transcript = await page.$$eval('.ytd-transcript-segment-renderer', segments =>
          segments.map(segment => segment.textContent.trim())
        );
        console.log('Transcript:', transcript.join('\n'));
      } else {
        console.log('No transcript available for this video.');
      }

      // Lấy bình luận (tối đa 5 bình luận đầu tiên)
      try {
        await page.waitForSelector('#comments', { timeout: 10000 });
        const comments = await page.$$eval('#content-text', comments =>
          comments.map(comment => comment.textContent.trim())
        );
        console.log('Comments:', comments.slice(0, 5)); // Lấy 5 bình luận đầu tiên
      } catch (error) {
        console.log('Error: Comments section not found or failed to load.');
      }
      
    } catch (error) {
      console.error('Error during scraping:', error.message);
      throw new Error('Failed to scrape data.');
    } finally {
      if (page) {
        await page.close();
      }
    }
  }
}
