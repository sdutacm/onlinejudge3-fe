import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import {
  IGetNoteListReq,
  IGetNoteListResp,
  IAddNoteReq,
  IAddNoteResp,
  IDeleteNoteReq,
} from '@/common/contracts/note';

export function getList(userId, query) {
  return post<IGetNoteListReq, IGetNoteListResp>(routesBe.getNoteList.url, {
    ...query,
  });
}

export function addNote(data) {
  return post<IAddNoteReq, IAddNoteResp>(routesBe.addNote.url, data);
}

export function deleteNote(noteId) {
  return post<IDeleteNoteReq, void>(routesBe.deleteNote.url, {
    noteId,
  });
}
