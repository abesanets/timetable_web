export class NoInternetException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoInternetException';
  }
}

export class GroupNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroupNotFoundException';
  }
}

export class TeacherNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TeacherNotFoundException';
  }
}

export class ServerErrorException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerErrorException';
  }
}

export const DEFAULT_PROXIES = [
  { name: 'CORSProxy.io', template: 'https://corsproxy.io/?url={url}' },
  { name: 'AllOrigins (Raw)', template: 'https://api.allorigins.win/raw?url={url}' },
  { name: 'Direct (No Proxy)', template: '{url}' }
];

export function getProxyUrl(targetUrl: string, proxyTemplate: string): string {
  if (!proxyTemplate) {
    return targetUrl;
  }
  return proxyTemplate.replace('{url}', encodeURIComponent(targetUrl));
}

export async function fetchScheduleHtml(group: string, proxyTemplate: string): Promise<string> {
  const url = `https://mgkct.minskedu.gov.by/personnel/for-students/weekly-timetable?group=${encodeURIComponent(group)}`;
  const requestUrl = getProxyUrl(url, proxyTemplate);

  try {
    const response = await fetch(requestUrl, {
      headers: {
        'Accept': 'text/html'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new GroupNotFoundException(`Группа ${group} не найдена`);
      }
      if (response.status >= 500) {
        throw new ServerErrorException('Сервер МГКЦТ временно недоступен');
      }
      throw new ServerErrorException(`Ошибка сервера (код ${response.status})`);
    }

    const html = await response.text();
    if (!html || html.trim().length === 0) {
      throw new ServerErrorException('Получен пустой ответ от сервера');
    }

    return html;
  } catch (error: any) {
    if (error instanceof GroupNotFoundException || error instanceof ServerErrorException) {
      throw error;
    }
    throw new NoInternetException('Сетевая ошибка. Проверьте подключение к интернету или попробуйте сменить CORS-прокси в настройках.');
  }
}

export async function fetchTeacherScheduleHtml(teacherName: string, proxyTemplate: string): Promise<string> {
  const url = `https://mgkct.minskedu.gov.by/personnel/for-teachers/weekly-timetable?teacher=${encodeURIComponent(teacherName)}`;
  const requestUrl = getProxyUrl(url, proxyTemplate);

  try {
    const response = await fetch(requestUrl, {
      headers: {
        'Accept': 'text/html'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new TeacherNotFoundException(`Преподаватель ${teacherName} не найден`);
      }
      if (response.status >= 500) {
        throw new ServerErrorException('Сервер МГКЦТ временно недоступен');
      }
      throw new ServerErrorException(`Ошибка сервера (код ${response.status})`);
    }

    const html = await response.text();
    if (!html || html.trim().length === 0) {
      throw new ServerErrorException('Получен пустой ответ от сервера');
    }

    return html;
  } catch (error: any) {
    if (error instanceof TeacherNotFoundException || error instanceof ServerErrorException) {
      throw error;
    }
    throw new NoInternetException('Сетевая ошибка. Проверьте подключение к интернету или попробуйте сменить CORS-прокси в настройках.');
  }
}
