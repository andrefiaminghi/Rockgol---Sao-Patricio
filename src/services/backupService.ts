import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { TournamentState } from '../types/tournament';

export function exportTournamentBackup(state: TournamentState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Salva o backup JSON permitindo que o usuário escolha a pasta de destino
 * tanto no Android nativo quanto em navegadores web.
 */
export async function saveTournamentBackupFile(state: TournamentState): Promise<{ success: boolean; message: string }> {
  const json = exportTournamentBackup(state);
  const fileName = `rockgol_2026_backup_${new Date().toISOString().slice(0, 10)}.json`;

  // 1. No Android / iOS Nativo
  if (Capacitor.isNativePlatform()) {
    try {
      const fileResult = await Filesystem.writeFile({
        path: fileName,
        data: json,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });

      await Share.share({
        title: 'Backup RockGol 2026',
        url: fileResult.uri,
        dialogTitle: 'Salvar ou Compartilhar Arquivo de Backup'
      });

      return {
        success: true,
        message: 'Arquivo gerado! Escolha a pasta ou aplicativo onde deseja salvar.'
      };
    } catch (err: any) {
      if (err.message && (err.message.includes('canceled') || err.message.includes('cancelled') || err.message.includes('dismissed'))) {
        return { success: true, message: 'Operação finalizada pelo usuário.' };
      }
      return { success: false, message: `Erro ao salvar no aparelho: ${err.message}` };
    }
  }

  // 2. Navegador Web com suporte a escolha de pasta (File System Access API)
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'Arquivo de Backup JSON',
            accept: { 'application/json': ['.json'] }
          }
        ]
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      return {
        success: true,
        message: 'Backup salvo com sucesso no local selecionado!'
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: true, message: 'Seleção de pasta cancelada.' };
      }
    }
  }

  // 3. Fallback Web clássico via link de download
  try {
    if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      return {
        success: true,
        message: 'Backup JSON processado com sucesso!'
      };
    }

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return {
      success: true,
      message: 'Backup JSON baixado com sucesso!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao baixar arquivo: ${err.message}`
    };
  }
}

export function importTournamentBackup(jsonContent: string): {
  success: boolean;
  state?: TournamentState;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonContent);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Arquivo de backup com formato inválido.' };
    }

    if (!Array.isArray(parsed.teams) || parsed.teams.length !== 7) {
      return { success: false, error: 'Backup deve conter exatamente 7 equipes.' };
    }

    if (!Array.isArray(parsed.matches) || parsed.matches.length !== 21) {
      return { success: false, error: 'Backup deve conter exatamente 21 partidas da 1ª fase.' };
    }

    if (!Array.isArray(parsed.knockoutMatches) || parsed.knockoutMatches.length !== 4) {
      return { success: false, error: 'Backup deve conter exatamente 4 confrontos de mata-mata.' };
    }

    return { success: true, state: parsed as TournamentState };
  } catch (err: any) {
    return { success: false, error: `Falha ao processar arquivo JSON: ${err.message}` };
  }
}
