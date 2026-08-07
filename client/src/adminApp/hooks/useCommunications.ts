import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bulkSend, deleteCommunication, getCommunication, getCommunications, resendCommunication, sendEmail, sendSMS, sendWhatsApp, type CommunicationPayload, type CommunicationQuery } from '../services/communicationService';

export const useCommunications = (query: CommunicationQuery = {}) => useQuery({ queryKey: ['communications', query], queryFn: () => getCommunications(query), staleTime: 30_000, refetchInterval: 60_000 });
export const useCommunication = (id?: string) => useQuery({ queryKey: ['communication', id], queryFn: () => getCommunication(id!), enabled: Boolean(id) });
const useSend = (fn: (payload: CommunicationPayload) => Promise<unknown>) => { const queryClient = useQueryClient(); return useMutation({ mutationFn: fn, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communications'] }) }); };
export const useSendEmail = () => useSend(sendEmail);
export const useSendSMS = () => useSend(sendSMS);
export const useSendWhatsApp = () => useSend(sendWhatsApp);
export const useBulkSend = () => { const queryClient = useQueryClient(); return useMutation({ mutationFn: bulkSend, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communications'] }) }); };
export const useDeleteCommunication = () => { const queryClient = useQueryClient(); return useMutation({ mutationFn: deleteCommunication, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communications'] }) }); };
export const useResendCommunication = () => { const queryClient = useQueryClient(); return useMutation({ mutationFn: resendCommunication, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communications'] }) }); };
