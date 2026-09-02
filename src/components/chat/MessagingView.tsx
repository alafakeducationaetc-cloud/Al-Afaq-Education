import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { ChatMessage, MessageAttachment, Activity, StudentProfile, TeacherProfile } from '../../types';
import { ActivityPlayer } from '../activities/ActivityPlayer';
import {
  MessageCircle,
  Send,
  Image as ImageIcon,
  FileText,
  Gamepad2,
  Paperclip,
  Search,
  Users,
  User,
  Shield,
  Eye,
  CheckCheck,
  Download,
  Play,
  X,
  Sparkles,
  ChevronRight,
  Filter,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';

interface MessagingViewProps {
  initialThreadId?: string;
  initialIsGroup?: boolean;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  initialThreadId,
  initialIsGroup,
}) => {
  const {
    currentUser,
    messages,
    sendMessage,
    markMessagesAsRead,
    students,
    teachers,
    classes,
    programs,
    activities,
  } = useApp();
  const { isRTL } = useI18n();

  const userRole = currentUser?.role || 'STUDENT';
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
  const isTeacher = userRole === 'TEACHER';
  const isStudent = userRole === 'STUDENT';

  // Active selected thread state
  const [selectedThreadKey, setSelectedThreadKey] = useState<string>(() => {
    if (initialThreadId) {
      return initialIsGroup ? `group-${initialThreadId}` : `private-${initialThreadId}`;
    }
    return '';
  });

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PRIVATE' | 'GROUP'>('ALL');

  // Modals inside chat
  const [showGamePickerModal, setShowGamePickerModal] = useState(false);
  const [selectedGameForModal, setSelectedGameForModal] = useState<Activity | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // File upload refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compute all available threads
  const threads = useMemo(() => {
    const list: {
      key: string;
      id: string;
      isGroup: boolean;
      title: string;
      subtitle: string;
      avatar?: string;
      roleBadge?: string;
      lastMessage?: ChatMessage;
      unreadCount: number;
    }[] = [];

    if (isAdmin) {
      // 1. Direct 1-on-1 with All Students
      students.forEach(std => {
        const threadMsgs = messages.filter(
          m =>
            !m.isGroup &&
            ((m.senderId === currentUser.id && m.recipientId === std.id) ||
              (m.senderId === std.id && m.recipientId === currentUser.id))
        );
        const lastMsg = threadMsgs[threadMsgs.length - 1];
        const unreadCount = threadMsgs.filter(
          m => m.senderId === std.id && (!m.readBy || !m.readBy.includes(currentUser.id))
        ).length;

        list.push({
          key: `private-std-${std.id}`,
          id: std.id,
          isGroup: false,
          title: isRTL ? std.nameArabic || std.name : std.name,
          subtitle: isRTL ? `طالب (كود: ${std.code})` : `Student (${std.code})`,
          avatar: std.avatarUrl,
          roleBadge: isRTL ? 'طالب' : 'Student',
          lastMessage: lastMsg,
          unreadCount,
        });
      });

      // 2. Direct 1-on-1 with All Teachers
      teachers.forEach(tea => {
        const threadMsgs = messages.filter(
          m =>
            !m.isGroup &&
            ((m.senderId === currentUser.id && m.recipientId === tea.id) ||
              (m.senderId === tea.id && m.recipientId === currentUser.id))
        );
        const lastMsg = threadMsgs[threadMsgs.length - 1];
        const unreadCount = threadMsgs.filter(
          m => m.senderId === tea.id && (!m.readBy || !m.readBy.includes(currentUser.id))
        ).length;

        list.push({
          key: `private-tea-${tea.id}`,
          id: tea.id,
          isGroup: false,
          title: isRTL ? tea.nameArabic || tea.name : tea.name,
          subtitle: isRTL ? `معلم (كود: ${tea.code})` : `Teacher (${tea.code})`,
          avatar: tea.avatarUrl,
          roleBadge: isRTL ? 'معلم' : 'Teacher',
          lastMessage: lastMsg,
          unreadCount,
        });
      });

      // 3. Monitored Student-Teacher conversation pairs across the platform
      const userPairs = new Set<string>();
      messages.forEach(m => {
        if (!m.isGroup && m.recipientId && m.senderId !== currentUser.id && m.recipientId !== currentUser.id) {
          const pairKey = [m.senderId, m.recipientId].sort().join('__');
          userPairs.add(pairKey);
        }
      });

      students.forEach(std => {
        std.assignedTeacherIds.forEach(teaId => {
          const pairKey = [std.id, teaId].sort().join('__');
          userPairs.add(pairKey);
        });
      });

      userPairs.forEach(pair => {
        const [id1, id2] = pair.split('__');
        const user1 = students.find(s => s.id === id1) || teachers.find(t => t.id === id1);
        const user2 = students.find(s => s.id === id2) || teachers.find(t => t.id === id2);

        if (user1 && user2) {
          const pairMessages = messages.filter(
            m =>
              !m.isGroup &&
              ((m.senderId === id1 && m.recipientId === id2) ||
                (m.senderId === id2 && m.recipientId === id1))
          );
          const lastMsg = pairMessages[pairMessages.length - 1];

          list.push({
            key: `monitor-${pair}`,
            id: pair,
            isGroup: false,
            title: `👁️ ${user1.name} ↔ ${user2.name}`,
            subtitle: isRTL ? `مراقبة محادثة طالب ومعلم` : `Monitored Pair`,
            avatar: user1.avatarUrl || user2.avatarUrl,
            roleBadge: isRTL ? 'مراقبة' : 'Monitor',
            lastMessage: lastMsg,
            unreadCount: 0,
          });
        }
      });

      // 4. All Group Circles
      const groupMap = new Map<string, string>();
      messages.forEach(m => {
        if (m.isGroup && m.groupId) {
          groupMap.set(m.groupId, m.groupTitle || 'حلقة تعليمية جماعية');
        }
      });
      classes.forEach(c => {
        if (c.studentIds.length > 1) {
          groupMap.set(c.id, isRTL ? c.titleArabic || c.title : c.title);
        }
      });

      groupMap.forEach((title, groupId) => {
        const grpMessages = messages.filter(m => m.isGroup && m.groupId === groupId);
        const lastMsg = grpMessages[grpMessages.length - 1];
        list.push({
          key: `group-${groupId}`,
          id: groupId,
          isGroup: true,
          title,
          subtitle: isRTL ? 'حلقة تعليمية تفاعلية جماعية' : 'Interactive Group Circle',
          lastMessage: lastMsg,
          unreadCount: 0,
        });
      });
    } else if (isTeacher) {
      // 1. Direct Admin Thread (Administration / Supervision)
      const adminMsgs = messages.filter(
        m =>
          !m.isGroup &&
          ((m.senderId === currentUser.id && (m.recipientId === 'usr-adm-1' || m.recipientId === 'admin')) ||
            ((m.senderId === 'usr-adm-1' || m.senderId === 'admin') && m.recipientId === currentUser.id))
      );
      const lastAdminMsg = adminMsgs[adminMsgs.length - 1];
      const unreadAdminCount = adminMsgs.filter(
        m => m.senderId !== currentUser.id && (!m.readBy || !m.readBy.includes(currentUser.id))
      ).length;

      list.push({
        key: 'private-admin',
        id: 'usr-adm-1',
        isGroup: false,
        title: isRTL ? 'إدارة منصة الآفاق (المشرف العام)' : 'Al-Afak Administration',
        subtitle: isRTL ? 'المشرف العام والإدارة الأكاديمية' : 'General Supervisor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        roleBadge: isRTL ? 'الإدارة' : 'Admin',
        lastMessage: lastAdminMsg,
        unreadCount: unreadAdminCount,
      });

      // 2. All Students (assigned & platform)
      const targetStudents = new Map<string, StudentProfile>();
      students.forEach(s => {
        if (s.assignedTeacherIds.includes(currentUser.id)) {
          targetStudents.set(s.id, s);
        }
      });
      classes.forEach(c => {
        if (c.teacherId === currentUser.id) {
          c.studentIds.forEach(sId => {
            const std = students.find(s => s.id === sId);
            if (std) targetStudents.set(std.id, std);
          });
        }
      });
      // Also add any other student that messaged the teacher or all students if few
      students.forEach(s => targetStudents.set(s.id, s));

      targetStudents.forEach(std => {
        const threadMsgs = messages.filter(
          m =>
            !m.isGroup &&
            ((m.senderId === currentUser.id && m.recipientId === std.id) ||
              (m.senderId === std.id && m.recipientId === currentUser.id))
        );
        const lastMsg = threadMsgs[threadMsgs.length - 1];
        const unreadCount = threadMsgs.filter(
          m => m.senderId === std.id && (!m.readBy || !m.readBy.includes(currentUser.id))
        ).length;

        list.push({
          key: `private-${std.id}`,
          id: std.id,
          isGroup: false,
          title: isRTL ? std.nameArabic || std.name : std.name,
          subtitle: isRTL ? `طالب (كود: ${std.code})` : `Student (${std.code})`,
          avatar: std.avatarUrl,
          roleBadge: isRTL ? 'طالب' : 'Student',
          lastMessage: lastMsg,
          unreadCount,
        });
      });

      // 3. Group classes the teacher manages
      const myGroupClasses = classes.filter(c => c.teacherId === currentUser.id && c.studentIds.length > 1);
      const groupIds = new Set<string>(myGroupClasses.map(c => c.id));
      messages.forEach(m => {
        if (m.isGroup && m.groupId && m.senderId === currentUser.id) {
          groupIds.add(m.groupId);
        }
      });

      groupIds.forEach(gId => {
        const cls = classes.find(c => c.id === gId);
        const title = cls ? (isRTL ? cls.titleArabic || cls.title : cls.title) : 'حلقة تعليمية جماعية';
        const grpMessages = messages.filter(m => m.isGroup && m.groupId === gId);
        const lastMsg = grpMessages[grpMessages.length - 1];
        const unreadCount = grpMessages.filter(
          m => m.senderId !== currentUser.id && (!m.readBy || !m.readBy.includes(currentUser.id))
        ).length;

        list.push({
          key: `group-${gId}`,
          id: gId,
          isGroup: true,
          title,
          subtitle: isRTL ? `حلقة (${cls?.studentIds.length || 0} طلاب)` : `Circle (${cls?.studentIds.length || 0} students)`,
          lastMessage: lastMsg,
          unreadCount,
        });
      });
    } else if (isStudent) {
      // 1. Administration Thread (Al-Afak Admin)
      const adminMsgs = messages.filter(
        m =>
          !m.isGroup &&
          ((m.senderId === currentUser.id && (m.recipientId === 'usr-adm-1' || m.recipientId === 'admin')) ||
            ((m.senderId === 'usr-adm-1' || m.senderId === 'admin') && m.recipientId === currentUser.id))
      );
      const lastAdminMsg = adminMsgs[adminMsgs.length - 1];
      const unreadAdminCount = adminMsgs.filter(
        m => (m.senderId === 'usr-adm-1' || m.senderId === 'admin') && (!m.readBy || !m.readBy.includes(currentUser.id))
      ).length;

      list.push({
        key: 'private-admin',
        id: 'usr-adm-1',
        isGroup: false,
        title: isRTL ? 'إدارة منصة الآفاق (المشرف العام)' : 'Al-Afak Administration',
        subtitle: isRTL ? 'الإدارة العامة والمتابعة الأكاديمية' : 'General Administration',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        roleBadge: isRTL ? 'الإدارة' : 'Admin',
        lastMessage: lastAdminMsg,
        unreadCount: unreadAdminCount,
      });

      // 2. All assigned teachers and teachers from student classes
      const studentObj = students.find(s => s.id === currentUser.id);
      const myTeacherIds = new Set<string>(studentObj?.assignedTeacherIds || []);
      classes.forEach(c => {
        if (c.studentIds.includes(currentUser.id)) {
          myTeacherIds.add(c.teacherId);
        }
      });
      // Also add any teacher who sent a direct message to this student
      messages.forEach(m => {
        if (!m.isGroup && m.recipientId === currentUser.id) {
          myTeacherIds.add(m.senderId);
        }
      });
      // Fallback: if no assigned teachers, list all available teachers
      if (myTeacherIds.size === 0) {
        teachers.forEach(t => myTeacherIds.add(t.id));
      }

      myTeacherIds.forEach(teaId => {
        if (teaId === 'usr-adm-1' || teaId === 'admin') return;
        const tea = teachers.find(t => t.id === teaId);
        if (tea) {
          const threadMsgs = messages.filter(
            m =>
              !m.isGroup &&
              ((m.senderId === currentUser.id && m.recipientId === tea.id) ||
                (m.senderId === tea.id && m.recipientId === currentUser.id))
          );
          const lastMsg = threadMsgs[threadMsgs.length - 1];
          const unreadCount = threadMsgs.filter(
            m => m.senderId === tea.id && (!m.readBy || !m.readBy.includes(currentUser.id))
          ).length;

          list.push({
            key: `private-${tea.id}`,
            id: tea.id,
            isGroup: false,
            title: isRTL ? tea.nameArabic || tea.name : tea.name,
            subtitle: isRTL ? `معلم ومحفّظ` : `Instructor`,
            avatar: tea.avatarUrl,
            roleBadge: isRTL ? 'معلم' : 'Teacher',
            lastMessage: lastMsg,
            unreadCount,
          });
        }
      });

      // 3. Group circles the student belongs to
      const myGroupClasses = classes.filter(c => c.studentIds.includes(currentUser.id) && c.studentIds.length > 1);
      myGroupClasses.forEach(cls => {
        const title = isRTL ? cls.titleArabic || cls.title : cls.title;
        const grpMessages = messages.filter(m => m.isGroup && m.groupId === cls.id);
        const lastMsg = grpMessages[grpMessages.length - 1];
        const unreadCount = grpMessages.filter(
          m => m.senderId !== currentUser.id && (!m.readBy || !m.readBy.includes(currentUser.id))
        ).length;

        list.push({
          key: `group-${cls.id}`,
          id: cls.id,
          isGroup: true,
          title,
          subtitle: isRTL ? 'حلقة تعليمية جماعية' : 'Group Circle',
          lastMessage: lastMsg,
          unreadCount,
        });
      });
    }

    return list;
  }, [isAdmin, isTeacher, isStudent, currentUser, messages, students, teachers, classes, isRTL]);

  // Set default selected thread if none is selected
  useEffect(() => {
    if (!selectedThreadKey && threads.length > 0) {
      setSelectedThreadKey(threads[0].key);
    }
  }, [threads, selectedThreadKey]);

  // Selected thread object
  const activeThread = useMemo(() => {
    return threads.find(t => t.key === selectedThreadKey) || threads[0] || null;
  }, [threads, selectedThreadKey]);

  // Messages in active thread
  const activeMessages = useMemo(() => {
    if (!activeThread) return [];

    if (activeThread.isGroup) {
      return messages.filter(m => m.isGroup && m.groupId === activeThread.id);
    }

    // Private 1-on-1 thread
    if (isAdmin && activeThread.id.includes('__')) {
      const [id1, id2] = activeThread.id.split('__');
      return messages.filter(
        m =>
          !m.isGroup &&
          ((m.senderId === id1 && m.recipientId === id2) ||
            (m.senderId === id2 && m.recipientId === id1))
      );
    }

    if (currentUser) {
      const partnerId = activeThread.id;
      return messages.filter(
        m =>
          !m.isGroup &&
          ((m.senderId === currentUser.id && m.recipientId === partnerId) ||
            (m.senderId === partnerId && m.recipientId === currentUser.id))
      );
    }

    return [];
  }, [activeThread, messages, isAdmin, currentUser]);

  // Mark as read when active thread changes
  useEffect(() => {
    if (activeThread && currentUser) {
      markMessagesAsRead(activeThread.id);
    }
  }, [activeThread?.key, activeMessages.length]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  // Filtered threads list based on search
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      if (filterType === 'PRIVATE' && t.isGroup) return false;
      if (filterType === 'GROUP' && !t.isGroup) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        (t.lastMessage?.content || '').toLowerCase().includes(q)
      );
    });
  }, [threads, filterType, searchQuery]);

  // Send Text Message Handler
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !currentUser || !activeThread) return;

    if (activeThread.isGroup) {
      sendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        senderAvatar: (currentUser as any).avatarUrl,
        groupId: activeThread.id,
        groupTitle: activeThread.title,
        isGroup: true,
        content: messageInput.trim(),
      });
    } else {
      let recipientId = activeThread.id;
      if (isAdmin && activeThread.id.includes('__')) {
        const [id1, id2] = activeThread.id.split('__');
        recipientId = currentUser.id === id1 ? id2 : id1;
      }

      sendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        senderAvatar: (currentUser as any).avatarUrl,
        recipientId,
        isGroup: false,
        content: messageInput.trim(),
      });
    }

    setMessageInput('');
  };

  // Send Image Attachment Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !activeThread) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const attachment: MessageAttachment = {
        id: `att-${Date.now()}`,
        type: 'IMAGE',
        name: file.name,
        url: dataUrl,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      };

      if (activeThread.isGroup) {
        sendMessage({
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          senderAvatar: (currentUser as any).avatarUrl,
          groupId: activeThread.id,
          groupTitle: activeThread.title,
          isGroup: true,
          content: isRTL ? `قام بإرسال صورة: ${file.name}` : `Sent an image: ${file.name}`,
          attachments: [attachment],
        });
      } else {
        let recipientId = activeThread.id;
        if (isAdmin && activeThread.id.includes('__')) {
          const [id1, id2] = activeThread.id.split('__');
          recipientId = currentUser.id === id1 ? id2 : id1;
        }

        sendMessage({
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          senderAvatar: (currentUser as any).avatarUrl,
          recipientId,
          isGroup: false,
          content: isRTL ? `قام بإرسال صورة: ${file.name}` : `Sent an image: ${file.name}`,
          attachments: [attachment],
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Send File/Worksheet Attachment Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !activeThread) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const attachment: MessageAttachment = {
        id: `att-file-${Date.now()}`,
        type: 'FILE',
        name: file.name,
        url: dataUrl,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      };

      if (activeThread.isGroup) {
        sendMessage({
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          senderAvatar: (currentUser as any).avatarUrl,
          groupId: activeThread.id,
          groupTitle: activeThread.title,
          isGroup: true,
          content: isRTL ? `قام بإرسال ملف تدريب / ورقة عمل: ${file.name}` : `Sent a worksheet / file: ${file.name}`,
          attachments: [attachment],
        });
      } else {
        let recipientId = activeThread.id;
        if (isAdmin && activeThread.id.includes('__')) {
          const [id1, id2] = activeThread.id.split('__');
          recipientId = currentUser.id === id1 ? id2 : id1;
        }

        sendMessage({
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          senderAvatar: (currentUser as any).avatarUrl,
          recipientId,
          isGroup: false,
          content: isRTL ? `قام بإرسال ملف تدريب / ورقة عمل: ${file.name}` : `Sent a worksheet / file: ${file.name}`,
          attachments: [attachment],
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Send Platform Electronic Educational Game Link
  const handleSendGameLink = (activity: Activity) => {
    if (!currentUser || !activeThread) return;

    const attachment: MessageAttachment = {
      id: `att-game-${Date.now()}`,
      type: 'GAME_LINK',
      name: isRTL ? activity.nameArabic || activity.name : activity.name,
      url: '#',
      activityId: activity.id,
    };

    if (activeThread.isGroup) {
      sendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        senderAvatar: (currentUser as any).avatarUrl,
        groupId: activeThread.id,
        groupTitle: activeThread.title,
        isGroup: true,
        content: isRTL
          ? `🎮 شارك لعبة تفاعلية تعليمية من المنصة: ${attachment.name}`
          : `🎮 Shared an educational interactive game: ${attachment.name}`,
        attachments: [attachment],
      });
    } else {
      let recipientId = activeThread.id;
      if (isAdmin && activeThread.id.includes('__')) {
        const [id1, id2] = activeThread.id.split('__');
        recipientId = currentUser.id === id1 ? id2 : id1;
      }

      sendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        senderAvatar: (currentUser as any).avatarUrl,
        recipientId,
        isGroup: false,
        content: isRTL
          ? `🎮 شارك لعبة تفاعلية تعليمية من المنصة: ${attachment.name}`
          : `🎮 Shared an educational interactive game: ${attachment.name}`,
        attachments: [attachment],
      });
    }

    setShowGamePickerModal(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[900px] bg-white night:bg-[#1A1633] rounded-3xl border border-[#29235D]/15 night:border-[#393168] shadow-xl overflow-hidden animate-in fade-in">
      {/* Covert Admin Surveillance Header (Strictly rendered ONLY for Admin) */}
      {isAdmin && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/15 via-[#29235D]/20 to-purple-900/20 border-b border-[#29235D]/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#29235D] night:text-[#E8D5A3] font-bold">
            <Eye className="w-4 h-4 text-[#D3B673]" />
            <span>
              {isRTL
                ? '👁️ وضع رقابة الإدارة العامة والمتابعة الإشرافية المباشرة (المراقبة خفية تماماً وغير مرئية لأطراف المحادثة)'
                : '👁️ Super Admin Invisible Oversight (Monitoring is confidential and invisible to participants)'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-gray-500 night:text-gray-400 font-bold px-2 py-0.5 rounded-full bg-white/60 night:bg-black/40">
            {threads.length} {isRTL ? 'محادثة جارية' : 'active threads'}
          </span>
        </div>
      )}

      {/* Main Layout: Threads Sidebar + Chat Window */}
      <div className="flex flex-1 overflow-hidden">
        {/* Threads List Sidebar */}
        <div className="w-full sm:w-80 md:w-96 border-r rtl:border-r-0 rtl:border-l border-gray-200 night:border-gray-800 flex flex-col bg-[#F8F6F0] night:bg-[#1D1845] flex-shrink-0">
          {/* Search & Filter Header */}
          <div className="p-3.5 border-b border-gray-200 night:border-gray-800 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 rtl:right-3 rtl:left-auto left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'بحث في المحادثات...' : 'Search threads...'}
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-gray-300 night:border-gray-700 bg-white night:bg-[#1A1633] text-xs font-semibold placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterType('ALL')}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterType === 'ALL'
                    ? 'bg-[#29235D] text-[#D3B673]'
                    : 'bg-white/80 night:bg-[#251F45] text-gray-600 night:text-gray-400'
                }`}
              >
                {isRTL ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setFilterType('PRIVATE')}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterType === 'PRIVATE'
                    ? 'bg-[#29235D] text-[#D3B673]'
                    : 'bg-white/80 night:bg-[#251F45] text-gray-600 night:text-gray-400'
                }`}
              >
                {isRTL ? 'خاص' : '1-on-1'}
              </button>
              <button
                onClick={() => setFilterType('GROUP')}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterType === 'GROUP'
                    ? 'bg-[#29235D] text-[#D3B673]'
                    : 'bg-white/80 night:bg-[#251F45] text-gray-600 night:text-gray-400'
                }`}
              >
                {isRTL ? 'حلقات ومجموعات' : 'Groups'}
              </button>
            </div>
          </div>

          {/* Threads Scroll List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-10 px-4 text-gray-400 text-xs">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#D3B673]" />
                <p>{isRTL ? 'لا توجد محادثات مطابقة' : 'No conversations found'}</p>
              </div>
            ) : (
              filteredThreads.map(thread => {
                const isSelected = thread.key === selectedThreadKey;
                return (
                  <button
                    key={thread.key}
                    onClick={() => setSelectedThreadKey(thread.key)}
                    className={`w-full text-right rtl:text-right ltr:text-left p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 border ${
                      isSelected
                        ? 'bg-white night:bg-[#251F45] border-[#D3B673]/60 shadow-md ring-1 ring-[#D3B673]/30'
                        : 'bg-white/60 night:bg-[#1A1633]/60 border-transparent hover:bg-white night:hover:bg-[#251F45]'
                    }`}
                  >
                    {/* Avatar / Group Icon */}
                    <div className="relative flex-shrink-0 mt-0.5">
                      {thread.avatar ? (
                        <img
                          src={thread.avatar}
                          alt={thread.title}
                          className="w-11 h-11 rounded-2xl object-cover border border-[#29235D]/10"
                        />
                      ) : (
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${
                            thread.isGroup
                              ? 'bg-gradient-to-br from-purple-600 to-indigo-800'
                              : 'bg-gradient-to-br from-[#29235D] to-[#1D1845]'
                          }`}
                        >
                          {thread.isGroup ? (
                            <Users className="w-5 h-5 text-[#E8D5A3]" />
                          ) : (
                            <User className="w-5 h-5 text-[#E8D5A3]" />
                          )}
                        </div>
                      )}
                      {thread.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Thread Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-[#29235D] night:text-[#E8D5A3] truncate">
                          {thread.title}
                        </span>
                        {thread.lastMessage && (
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {thread.lastMessage.timestamp.split(' ')[1] || ''}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 night:text-gray-400">
                        <span className="truncate">
                          {thread.lastMessage?.content || thread.subtitle}
                        </span>
                        {thread.isGroup && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 night:bg-purple-950/60 night:text-purple-300 flex-shrink-0 ml-1">
                            {isRTL ? 'حلقة' : 'Group'}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Active Chat Conversation Area */}
        <div className="flex-1 flex flex-col bg-white night:bg-[#1A1633] overflow-hidden">
          {activeThread ? (
            <>
              {/* Chat Window Header */}
              <div className="p-4 border-b border-gray-200 night:border-gray-800 bg-[#F8F6F0] night:bg-[#1D1845] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                      activeThread.isGroup
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-800'
                        : 'bg-gradient-to-br from-[#29235D] to-[#1D1845]'
                    }`}
                  >
                    {activeThread.isGroup ? (
                      <Users className="w-5 h-5 text-[#E8D5A3]" />
                    ) : (
                      <User className="w-5 h-5 text-[#E8D5A3]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#29235D] night:text-[#E8D5A3]">
                      {activeThread.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 night:text-gray-400">
                      {activeThread.subtitle}
                    </p>
                  </div>
                </div>

                {/* Quick actions in header */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowGamePickerModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#29235D]/10 hover:bg-[#29235D]/20 text-[#29235D] night:text-[#E8D5A3] text-xs font-bold transition-all cursor-pointer"
                    title={isRTL ? 'إرسال لعبة إلكترونية تفاعلية' : 'Send educational game'}
                  >
                    <Gamepad2 className="w-4 h-4 text-[#D3B673]" />
                    <span className="hidden sm:inline">
                      {isRTL ? 'إرسال لعبة تفاعلية' : 'Interactive Game'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Messages Flow Container */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-[#F8F6F0]/30 to-white night:from-[#1D1845]/20 night:to-[#1A1633]">
                {activeMessages.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-xs">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#D3B673] opacity-60" />
                    <p className="font-bold text-sm text-gray-600 night:text-gray-300">
                      {isRTL ? 'بداية المحادثة' : 'Conversation started'}
                    </p>
                    <p className="mt-1">
                      {isRTL
                        ? 'يمكنك تبادل الرسائل، إرسال ملفات التدريبات وواجبات الحصة، ومشاركة الألعاب التفاعلية.'
                        : 'Send messages, homework worksheets, images, and interactive games.'}
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg, index) => {
                    const isMyMessage = currentUser && msg.senderId === currentUser.id;
                    const isTeacherSender = msg.senderRole === 'TEACHER';
                    const isStudentSender = msg.senderRole === 'STUDENT';

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${
                          isMyMessage
                            ? 'mr-auto rtl:mr-0 rtl:ml-auto flex-row-reverse'
                            : 'ml-auto rtl:ml-0 rtl:mr-auto'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0 mt-1">
                          {msg.senderAvatar ? (
                            <img
                              src={msg.senderAvatar}
                              alt={msg.senderName}
                              className="w-8 h-8 rounded-xl object-cover border border-[#29235D]/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-[#29235D] text-[#E8D5A3] flex items-center justify-center font-bold text-xs">
                              {msg.senderName.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className="flex flex-col">
                          {/* Sender name & role badge */}
                          <div
                            className={`flex items-center gap-2 mb-1 text-[11px] font-bold ${
                              isMyMessage ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span className="text-[#29235D] night:text-[#E8D5A3]">
                              {msg.senderName}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] ${
                                isTeacherSender
                                  ? 'bg-amber-100 text-amber-900 night:bg-amber-950/60 night:text-amber-300'
                                  : isStudentSender
                                  ? 'bg-blue-100 text-blue-900 night:bg-blue-950/60 night:text-blue-300'
                                  : 'bg-purple-100 text-purple-900'
                              }`}
                            >
                              {isTeacherSender
                                ? isRTL ? 'معلم' : 'Teacher'
                                : isStudentSender
                                ? isRTL ? 'طالب' : 'Student'
                                : 'إدارة'}
                            </span>
                          </div>

                          {/* Message Content Bubble */}
                          <div
                            className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                              isMyMessage
                                ? 'bg-[#29235D] text-white rounded-tr-sm rtl:rounded-tr-2xl rtl:rounded-tl-sm'
                                : 'bg-gray-100 night:bg-[#251F45] text-gray-800 night:text-gray-100 rounded-tl-sm rtl:rounded-tl-2xl rtl:rounded-tr-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>

                            {/* Attachments rendering */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2.5 space-y-2">
                                {msg.attachments.map(att => {
                                  if (att.type === 'IMAGE') {
                                    return (
                                      <div
                                        key={att.id}
                                        onClick={() => setLightboxImageUrl(att.url)}
                                        className="cursor-pointer overflow-hidden rounded-xl border border-white/20 hover:opacity-90 transition-all max-w-sm"
                                      >
                                        <img
                                          src={att.url}
                                          alt={att.name}
                                          className="max-h-60 w-full object-cover"
                                        />
                                        <div className="p-1.5 bg-black/40 text-[10px] text-white flex items-center justify-between">
                                          <span className="truncate">{att.name}</span>
                                          <span>{att.size}</span>
                                        </div>
                                      </div>
                                    );
                                  }

                                  if (att.type === 'FILE') {
                                    return (
                                      <div
                                        key={att.id}
                                        className="p-2.5 rounded-xl bg-white/10 border border-white/20 flex items-center justify-between gap-3 text-xs"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <FileText className="w-4 h-4 text-[#D3B673] flex-shrink-0" />
                                          <div className="truncate">
                                            <div className="font-bold truncate">{att.name}</div>
                                            <div className="text-[10px] opacity-70">{att.size}</div>
                                          </div>
                                        </div>
                                        <a
                                          href={att.url}
                                          download={att.name}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all flex items-center gap-1 font-bold text-[10px] flex-shrink-0"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                          <span>{isRTL ? 'تحميل' : 'Download'}</span>
                                        </a>
                                      </div>
                                    );
                                  }

                                  if (att.type === 'GAME_LINK') {
                                    const linkedActivity = activities.find(a => a.id === att.activityId);
                                    return (
                                      <div
                                        key={att.id}
                                        className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-[#D3B673]/40 flex flex-col gap-2"
                                      >
                                        <div className="flex items-center gap-2 font-bold text-[#E8D5A3]">
                                          <Gamepad2 className="w-4 h-4 text-[#D3B673]" />
                                          <span>{att.name}</span>
                                        </div>
                                        <p className="text-[11px] opacity-80">
                                          {isRTL
                                            ? 'نشاط تعليمي تفاعلي من المنصة لترسيخ المفاهيم والتدريب المباشر.'
                                            : 'Interactive educational platform game for practice.'}
                                        </p>
                                        <button
                                          onClick={() => {
                                            if (linkedActivity) {
                                              setSelectedGameForModal(linkedActivity);
                                            } else if (activities[0]) {
                                              setSelectedGameForModal(activities[0]);
                                            }
                                          }}
                                          className="py-1.5 px-3 rounded-lg bg-[#D3B673] hover:bg-[#c4a663] text-[#29235D] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                        >
                                          <Play className="w-3.5 h-3.5 fill-current" />
                                          <span>{isRTL ? '🎮 بدء ولعب النشاط التفاعلي الآن' : 'Play Game Now'}</span>
                                        </button>
                                      </div>
                                    );
                                  }

                                  return null;
                                })}
                              </div>
                            )}
                          </div>

                          {/* Timestamp & Read indicator */}
                          <div
                            className={`flex items-center gap-1.5 mt-1 text-[10px] text-gray-400 ${
                              isMyMessage ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {isMyMessage && <CheckCheck className="w-3.5 h-3.5 text-[#D3B673]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 border-t border-gray-200 night:border-gray-800 bg-[#F8F6F0] night:bg-[#1D1845]">
                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  className="hidden"
                />

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  {/* Attachment Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="p-2.5 rounded-xl hover:bg-white night:hover:bg-[#251F45] text-gray-500 hover:text-[#29235D] night:hover:text-[#E8D5A3] transition-all cursor-pointer"
                      title={isRTL ? 'إرسال صورة' : 'Send Image'}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-xl hover:bg-white night:hover:bg-[#251F45] text-gray-500 hover:text-[#29235D] night:hover:text-[#E8D5A3] transition-all cursor-pointer"
                      title={isRTL ? 'إرسال ملف تدريب أو ورقة عمل' : 'Send Worksheet / File'}
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowGamePickerModal(true)}
                      className="p-2.5 rounded-xl hover:bg-white night:hover:bg-[#251F45] text-gray-500 hover:text-[#29235D] night:hover:text-[#E8D5A3] transition-all cursor-pointer"
                      title={isRTL ? 'إرسال رابط لعبة إلكترونية تفاعلية' : 'Send Interactive Game'}
                    >
                      <Gamepad2 className="w-4 h-4 text-[#D3B673]" />
                    </button>
                  </div>

                  {/* Input field */}
                  <input
                    type="text"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder={
                      isRTL
                        ? 'اكتب رسالتك هنا، أو أرفق تدريبات وألعاب تفاعلية...'
                        : 'Type a message, attach worksheets or games...'
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 night:border-gray-700 bg-white night:bg-[#1A1633] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
                  />

                  {/* Send button */}
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] hover:opacity-90 disabled:opacity-40 text-[#E8D5A3] font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{isRTL ? 'إرسال' : 'Send'}</span>
                    <Send className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 text-[#D3B673] mb-3 opacity-50" />
              <h3 className="font-bold text-base text-gray-700 night:text-gray-200">
                {isRTL ? 'اختر محادثة للبدء' : 'Select a conversation to start'}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                {isRTL
                  ? 'اختر حلقة جماعية أو محادثة خاصة مع المعلم أو الطالب لتبادل الرسائل والتدريبات والألعاب الإلكترونية.'
                  : 'Choose a group circle or private chat to exchange worksheets and games.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* GAME PICKER MODAL */}
      {showGamePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white night:bg-[#1A1633] w-full max-w-lg rounded-3xl border border-[#29235D]/20 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-gradient-to-r from-[#29235D] to-[#1D1845] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-[#D3B673]" />
                <h3 className="font-bold text-sm text-[#E8D5A3]">
                  {isRTL ? 'اختر لعبة إلكترونية تفاعلية لإرسالها' : 'Select Game to Share'}
                </h3>
              </div>
              <button
                onClick={() => setShowGamePickerModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#E8D5A3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              <p className="text-xs text-gray-500 night:text-gray-400">
                {isRTL
                  ? 'اختر أي نشاط أو لعبة من مكتبة المنصة التفاعلية لمشاركتها فورياً في المحادثة مع الطلاب أو المعلم:'
                  : 'Select an interactive activity from the platform library to share:'}
              </p>
              {activities.map(act => (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl border border-gray-200 night:border-gray-700 bg-[#F8F6F0] night:bg-[#251F45] hover:border-[#D3B673] flex items-center justify-between gap-3 transition-all"
                >
                  <div>
                    <div className="font-bold text-xs text-[#29235D] night:text-[#E8D5A3]">
                      {isRTL ? act.nameArabic || act.name : act.name}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">{act.code}</div>
                  </div>
                  <button
                    onClick={() => handleSendGameLink(act)}
                    className="px-3 py-1.5 rounded-xl bg-[#29235D] text-[#D3B673] hover:opacity-90 font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <span>{isRTL ? 'إرسال' : 'Share'}</span>
                    <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GAME PLAYER MODAL (LAUNCH GAME INSIDE CHAT) */}
      {selectedGameForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[90vh]">
            <ActivityPlayer
              activity={selectedGameForModal}
              onClose={() => setSelectedGameForModal(null)}
            />
          </div>
        </div>
      )}

      {/* LIGHTBOX FOR IMAGE PREVIEWS */}
      {lightboxImageUrl && (
        <div
          onClick={() => setLightboxImageUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={lightboxImageUrl}
              alt="Preview"
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain"
            />
            <button
              onClick={() => setLightboxImageUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
