/**
 * File system utility functions for saving generated scenarios
 * and managing component data
 */

/**
 * Generate a timestamp-based filename for scenario outputs
 * Format: scenario_YYYYMMDD_HHMMSS.txt
 */
export function generateScenarioFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `scenario_${year}${month}${day}_${hours}${minutes}${seconds}.txt`;
}

/**
 * Save scenario text to outputs directory
 * @param content - The scenario content to save
 * @returns The filename of the saved scenario
 */
export async function saveScenarioToFile(content: string): Promise<string> {
  const filename = generateScenarioFilename();
  const filepath = `/outputs/${filename}`;
  
  try {
    // In a real implementation, this would use Node.js fs module
    // For now, we'll use the browser's download mechanism
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return filename;
  } catch (error) {
    console.error('Error saving scenario file:', error);
    throw new Error('Failed to save scenario file');
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

